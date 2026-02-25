import { LinkedInAPI } from './index.js';
import { LiveDetector } from './liveDetector.js';
import { UserStore } from '../../stores/userStore.js';
import { OnChatMessageEvent } from '../../types/onChatMessageEvent.js';
import { OnCommandEvent } from '../../types/onCommandEvent.js';
import { Platform } from '../../types/platform.js';
import { StreamUser } from '../../types/streamUser.js';
import EventBus from '../../eventBus.js';
import { BotEvents } from '../../botEvents.js';
import { handleCommand } from '../../commands/registry.js';
import sanitizeHtml from 'sanitize-html';

export abstract class CommentPoller {
  private static pollInterval: NodeJS.Timeout | null = null;
  private static intervalMs: number;
  private static lastSeenTimestamp: number = 0;
  private static processedCommentIds: Set<string> = new Set();
  private static currentPostUrn: string | null = null;

  static start(postUrn: string): void {
    this.currentPostUrn = postUrn;
    this.intervalMs = parseInt(process.env.LINKEDIN_POLL_INTERVAL_MS || '5000');
    this.lastSeenTimestamp = Date.now();
    this.processedCommentIds.clear();

    this.pollComments(postUrn);

    this.pollInterval = setInterval(() => {
      this.pollComments(postUrn);
    }, this.intervalMs);

    console.log(`LinkedIn Comment Poller started for ${postUrn} (polling every ${this.intervalMs}ms)`);
  }

  static stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.lastSeenTimestamp = 0;
    this.processedCommentIds.clear();
    this.currentPostUrn = null;
    console.log('LinkedIn Comment Poller stopped');
  }

  private static async pollComments(postUrn: string): Promise<void> {
    try {
      const comments = await LinkedInAPI.getComments(postUrn);
      
      const newComments = comments.filter(comment => {
        const commentTime = comment.created?.time || 0;
        const commentUrn = comment.$URN || comment.id;
        
        return commentTime > this.lastSeenTimestamp && 
               !this.processedCommentIds.has(commentUrn);
      });

      for (const comment of newComments) {
        const commentUrn = comment.$URN || comment.id;
        const commentTime = comment.created?.time || Date.now();
        
        this.processedCommentIds.add(commentUrn);
        this.lastSeenTimestamp = Math.max(this.lastSeenTimestamp, commentTime);

        const actorUrn = comment.actor;
        if (!actorUrn) {
          continue;
        }

        const user = await UserStore.getUser(actorUrn, 'linkedin');
        if (!user) {
          continue;
        }

        await this.processComment(comment, user, postUrn);
      }
    } catch (error) {
      console.error('Error polling LinkedIn comments:', error);
    }
  }

  private static async processComment(comment: any, user: StreamUser, postUrn: string): Promise<void> {
    const messageText = comment.message?.text || '';
    
    if (!messageText) {
      return;
    }

    if (messageText.startsWith('!')) {
      const parts = messageText.substring(1).split(' ');
      const commandName = parts[0].toLowerCase();
      const commandMessage = parts.slice(1).join(' ');

      const defaultFlags = {
        broadcaster: false,
        mod: false,
        subscriber: false,
        vip: false,
        highlighted: false,
        customReward: false
      };

      const defaultExtra = {
        id: comment.$URN || comment.id || `linkedin-${Date.now()}`,
        channel: 'linkedin',
        roomId: '',
        messageType: 'chat',
        messageEmotes: {},
        isEmoteOnly: false,
        userId: user.login,
        username: user.login,
        displayName: user.display_name || user.login,
        userColor: '#0077B5',
        userBadges: {},
        customRewardId: '',
        flags: '',
        timestamp: `${comment.created?.time || Date.now()}`,
        sinceLastCommand: { any: 0, user: 0 }
      };

      const onCommandEvent = new OnCommandEvent(
        user.login,
        commandName,
        commandMessage,
        defaultFlags as any,
        defaultExtra as any
      );

      const commentUrn = comment.$URN || comment.id;
      const originalEmit = EventBus.eventEmitter.emit.bind(EventBus.eventEmitter);

      EventBus.eventEmitter.emit = (event: string, ...args: any[]) => {
        if (event === BotEvents.OnSay && args[0]) {
          args[0].platform = 'linkedin';
          args[0].context = { postUrn, commentUrn };
        }
        return originalEmit(event, ...args);
      };

      handleCommand(onCommandEvent);

      EventBus.eventEmitter.emit = originalEmit;
    } else {
      const sanitizedMessage = sanitizeHtml(messageText, {
        allowedTags: [],
        allowedAttributes: {}
      });

      const defaultFlags = {
        broadcaster: false,
        mod: false,
        subscriber: false,
        vip: false,
        highlighted: false,
        customReward: false
      };

      const defaultExtra = {
        id: comment.$URN || comment.id || `linkedin-${Date.now()}`,
        channel: 'linkedin',
        roomId: '',
        messageType: 'chat',
        messageEmotes: {},
        isEmoteOnly: false,
        userId: user.login,
        username: user.login,
        displayName: user.display_name || user.login,
        userColor: '#0077B5',
        userBadges: {},
        customRewardId: '',
        flags: '',
        timestamp: `${comment.created?.time || Date.now()}`,
        sinceLastCommand: { any: 0, user: 0 }
      };

      const chatEvent = new OnChatMessageEvent(
        user,
        messageText,
        sanitizedMessage,
        defaultFlags as any,
        false,
        defaultExtra as any,
        comment.$URN || comment.id || `linkedin-${Date.now()}`,
        'linkedin'
      );

      EventBus.eventEmitter.emit(BotEvents.OnChatMessage, chatEvent);
    }
  }
}
