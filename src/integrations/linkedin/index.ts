import { StreamUser } from '../../types/streamUser.js';
import { loadTokens, saveTokens } from './tokenStore.js';

interface AppCredentials {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
}

export abstract class LinkedInAPI {
  // General app — for posting replies (w_member_social / Share on LinkedIn)
  private static general: AppCredentials;
  // Community Management app — for reading comments, posts, profiles
  private static cm: AppCredentials;

  private static personUrn: string;
  private static baseUrl = 'https://api.linkedin.com/rest';
  private static apiVersion = '202401';

  static init(): boolean {
    this.personUrn = process.env.LINKEDIN_PERSON_URN || '';

    // Load env vars for both apps
    this.general = {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
      refreshToken: process.env.LINKEDIN_REFRESH_TOKEN || '',
    };

    this.cm = {
      clientId: process.env.LINKEDIN_CM_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CM_CLIENT_SECRET || '',
      accessToken: process.env.LINKEDIN_CM_ACCESS_TOKEN || '',
      refreshToken: process.env.LINKEDIN_CM_REFRESH_TOKEN || '',
    };

    // Override with persisted tokens if available
    const stored = loadTokens();
    if (stored) {
      if (stored.general) {
        this.general.accessToken = stored.general.access_token;
        this.general.refreshToken = stored.general.refresh_token;
      }
      if (stored.community_management) {
        this.cm.accessToken = stored.community_management.access_token;
        this.cm.refreshToken = stored.community_management.refresh_token;
      }
      if (stored.person_urn) {
        this.personUrn = stored.person_urn;
      }
      console.log('LinkedIn tokens loaded from .linkedin-tokens.json');
    }

    if (!this.isConfigured()) {
      console.warn('LinkedIn integration: Missing required environment variables');
      return false;
    }

    return true;
  }

  static isConfigured(): boolean {
    // Need at least the CM app (for reading) and person URN
    return !!(
      this.cm.clientId &&
      this.cm.clientSecret &&
      this.cm.accessToken &&
      this.personUrn
    );
  }

  static getGeneralClientId(): string { return this.general.clientId; }
  static getGeneralClientSecret(): string { return this.general.clientSecret; }
  static getCmClientId(): string { return this.cm.clientId; }
  static getCmClientSecret(): string { return this.cm.clientSecret; }
  static getPersonUrn(): string { return this.personUrn; }

  static setGeneralTokens(accessToken: string, refreshToken: string, personUrn?: string): void {
    this.general.accessToken = accessToken;
    this.general.refreshToken = refreshToken;
    if (personUrn) this.personUrn = personUrn;
    this.persistTokens();
  }

  static setCmTokens(accessToken: string, refreshToken: string): void {
    this.cm.accessToken = accessToken;
    this.cm.refreshToken = refreshToken;
    this.persistTokens();
  }

  private static persistTokens(): void {
    saveTokens({
      general: {
        access_token: this.general.accessToken,
        refresh_token: this.general.refreshToken,
        expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000),
      },
      community_management: {
        access_token: this.cm.accessToken,
        refresh_token: this.cm.refreshToken,
        expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000),
      },
      person_urn: this.personUrn,
    });
  }

  private static getHeaders(app: AppCredentials): Record<string, string> {
    return {
      'Authorization': `Bearer ${app.accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': this.apiVersion,
      'X-Restli-Protocol-Version': '2.0.0'
    };
  }

  private static async refreshAccessToken(app: AppCredentials): Promise<boolean> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: app.refreshToken,
          client_id: app.clientId,
          client_secret: app.clientSecret
        })
      });

      if (!response.ok) {
        console.error('LinkedIn token refresh failed:', response.status);
        return false;
      }

      const data = await response.json();
      app.accessToken = data.access_token;
      if (data.refresh_token) {
        app.refreshToken = data.refresh_token;
      }

      this.persistTokens();
      console.log('LinkedIn access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing LinkedIn access token:', error);
      return false;
    }
  }

  private static async apiRequest<T>(app: AppCredentials, url: string, options?: RequestInit): Promise<T | null> {
    try {
      const headers = this.getHeaders(app);
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options?.headers }
      });

      if (response.status === 401) {
        console.log('LinkedIn API 401 - attempting token refresh');
        const refreshed = await this.refreshAccessToken(app);
        if (refreshed) {
          const retryHeaders = this.getHeaders(app);
          const retryResponse = await fetch(url, {
            ...options,
            headers: { ...retryHeaders, ...options?.headers }
          });

          if (!retryResponse.ok) {
            console.error(`LinkedIn API retry failed: ${retryResponse.status}`);
            return null;
          }
          return await retryResponse.json() as T;
        }
        return null;
      }

      if (response.status === 429) {
        console.warn('LinkedIn API rate limit exceeded (429)');
        return null;
      }

      if (!response.ok) {
        console.error(`LinkedIn API request failed: ${response.status}`);
        return null;
      }

      return await response.json() as T;
    } catch (error) {
      console.error('LinkedIn API request error:', error);
      return null;
    }
  }

  // --- Community Management app (reading) ---

  static async getRecentPosts(): Promise<any[]> {
    const url = `${this.baseUrl}/posts?q=author&author=${encodeURIComponent(this.personUrn)}&count=10&sortBy=LAST_MODIFIED`;
    const response = await this.apiRequest<{ elements?: any[] }>(this.cm, url);
    return response?.elements || [];
  }

  static async getVideoDetails(videoUrn: string): Promise<any | null> {
    const url = `${this.baseUrl}/videos/${encodeURIComponent(videoUrn)}`;
    return await this.apiRequest<any>(this.cm, url);
  }

  static async getComments(postUrn: string, start: number = 0, count: number = 50): Promise<any[]> {
    const url = `${this.baseUrl}/socialActions/${encodeURIComponent(postUrn)}/comments?start=${start}&count=${count}`;
    const response = await this.apiRequest<{ elements?: any[] }>(this.cm, url);
    return response?.elements || [];
  }

  static async getUser(personUrn: string): Promise<StreamUser | null> {
    try {
      const personIdMatch = personUrn.match(/urn:li:person:(.+)/);
      if (!personIdMatch) {
        console.warn(`Invalid LinkedIn person URN format: ${personUrn}`);
        return new StreamUser(personUrn, 'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q', personUrn, new Date(), 'linkedin');
      }

      const personId = personIdMatch[1];
      const url = `${this.baseUrl}/people/(id:${personId})?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`;
      const person = await this.apiRequest<any>(this.cm, url);
      
      if (!person) {
        return new StreamUser(personUrn, 'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q', personUrn, new Date(), 'linkedin');
      }

      const firstNameObj = person.firstName?.localized;
      const lastNameObj = person.lastName?.localized;
      const firstName = firstNameObj?.en_US || Object.values(firstNameObj || {})[0] || '';
      const lastName = lastNameObj?.en_US || Object.values(lastNameObj || {})[0] || '';
      const displayName = `${firstName} ${lastName}`.trim() || personUrn;
      const avatarUrl = person.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier 
        || 'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q';

      return new StreamUser(personUrn, avatarUrl, displayName, new Date(), 'linkedin');
    } catch (error) {
      console.error('Error fetching LinkedIn user:', error);
      return new StreamUser(personUrn, 'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q', personUrn, new Date(), 'linkedin');
    }
  }

  // --- General app (writing) ---

  static async replyToComment(postUrn: string, parentCommentUrn: string, message: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/socialActions/${encodeURIComponent(postUrn)}/comments`;
      const response = await this.apiRequest<any>(this.general, url, {
        method: 'POST',
        body: JSON.stringify({
          actor: this.personUrn,
          message: { text: message },
          parentComment: parentCommentUrn
        })
      });
      return response !== null;
    } catch (error) {
      console.error('Error replying to LinkedIn comment:', error);
      return false;
    }
  }
}
