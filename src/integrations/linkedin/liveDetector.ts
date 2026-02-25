import { LinkedInAPI } from './index.js';

export abstract class LiveDetector {
  private static activePostUrn: string | null = null;
  private static pollInterval: NodeJS.Timeout | null = null;
  private static intervalMs: number;

  static onLiveStart: ((postUrn: string) => void) | null = null;
  static onLiveEnd: (() => void) | null = null;

  static start(): void {
    this.intervalMs = parseInt(process.env.LINKEDIN_LIVE_DETECT_INTERVAL_MS || '120000');
    
    this.checkForLivePost();
    
    this.pollInterval = setInterval(() => {
      this.checkForLivePost();
    }, this.intervalMs);

    console.log(`LinkedIn Live Detector started (polling every ${this.intervalMs}ms)`);
  }

  static stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('LinkedIn Live Detector stopped');
  }

  static getActivePostUrn(): string | null {
    return this.activePostUrn;
  }

  private static async checkForLivePost(): Promise<void> {
    try {
      const posts = await LinkedInAPI.getRecentPosts();
      
      let currentlyLivePostUrn: string | null = null;

      for (const post of posts) {
        const videoUrn = post.content?.media?.id;
        
        if (videoUrn && videoUrn.startsWith('urn:li:video:')) {
          const videoDetails = await LinkedInAPI.getVideoDetails(videoUrn);
          
          if (videoDetails?.uploadMechanism === 'LIVE' && 
              videoDetails?.liveStreamState === 'STREAMING') {
            currentlyLivePostUrn = post.id || post.$URN;
            break;
          }
        }
      }

      if (currentlyLivePostUrn && !this.activePostUrn) {
        this.activePostUrn = currentlyLivePostUrn;
        console.log(`LinkedIn Live detected: ${currentlyLivePostUrn}`);
        
        if (this.onLiveStart) {
          this.onLiveStart(currentlyLivePostUrn);
        }
      } else if (!currentlyLivePostUrn && this.activePostUrn) {
        console.log('LinkedIn Live ended');
        this.activePostUrn = null;
        
        if (this.onLiveEnd) {
          this.onLiveEnd();
        }
      }
    } catch (error) {
      console.error('Error checking for LinkedIn Live post:', error);
    }
  }
}
