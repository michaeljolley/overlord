import { StreamUser } from '../../types/streamUser.js';

export abstract class LinkedInAPI {
  private static accessToken: string;
  private static refreshToken: string;
  private static clientId: string;
  private static clientSecret: string;
  private static personUrn: string;
  private static baseUrl = 'https://api.linkedin.com/rest';
  private static apiVersion = '202401';

  static init(): boolean {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN || '';
    this.refreshToken = process.env.LINKEDIN_REFRESH_TOKEN || '';
    this.personUrn = process.env.LINKEDIN_PERSON_URN || '';

    if (!this.isConfigured()) {
      console.warn('LinkedIn integration: Missing required environment variables');
      return false;
    }

    return true;
  }

  static isConfigured(): boolean {
    return !!(
      this.clientId &&
      this.clientSecret &&
      this.accessToken &&
      this.refreshToken &&
      this.personUrn
    );
  }

  private static getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': this.apiVersion,
      'X-Restli-Protocol-Version': '2.0.0'
    };
  }

  private static async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      });

      if (!response.ok) {
        console.error('LinkedIn token refresh failed:', response.status);
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }

      console.log('LinkedIn access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing LinkedIn access token:', error);
      return false;
    }
  }

  private static async apiRequest<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
      const headers = this.getHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers
        }
      });

      if (response.status === 401) {
        console.log('LinkedIn API 401 - attempting token refresh');
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          const retryHeaders = this.getHeaders();
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...retryHeaders,
              ...options?.headers
            }
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

  static async getRecentPosts(): Promise<any[]> {
    const url = `${this.baseUrl}/posts?q=author&author=${encodeURIComponent(this.personUrn)}&count=10&sortBy=LAST_MODIFIED`;
    const response = await this.apiRequest<{ elements?: any[] }>(url);
    return response?.elements || [];
  }

  static async getVideoDetails(videoUrn: string): Promise<any | null> {
    const url = `${this.baseUrl}/videos/${encodeURIComponent(videoUrn)}`;
    return await this.apiRequest<any>(url);
  }

  static async getComments(postUrn: string, start: number = 0, count: number = 50): Promise<any[]> {
    const url = `${this.baseUrl}/socialActions/${encodeURIComponent(postUrn)}/comments?start=${start}&count=${count}`;
    const response = await this.apiRequest<{ elements?: any[] }>(url);
    return response?.elements || [];
  }

  static async getUser(personUrn: string): Promise<StreamUser | null> {
    try {
      const personIdMatch = personUrn.match(/urn:li:person:(.+)/);
      if (!personIdMatch) {
        console.warn(`Invalid LinkedIn person URN format: ${personUrn}`);
        return new StreamUser(
          personUrn,
          'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q',
          personUrn,
          new Date(),
          'linkedin'
        );
      }

      const personId = personIdMatch[1];
      const url = `${this.baseUrl}/people/(id:${personId})?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`;
      
      const person = await this.apiRequest<any>(url);
      
      if (!person) {
        return new StreamUser(
          personUrn,
          'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q',
          personUrn,
          new Date(),
          'linkedin'
        );
      }

      const firstNameObj = person.firstName?.localized;
      const lastNameObj = person.lastName?.localized;
      
      const firstName = firstNameObj?.en_US || Object.values(firstNameObj || {})[0] || '';
      const lastName = lastNameObj?.en_US || Object.values(lastNameObj || {})[0] || '';
      const displayName = `${firstName} ${lastName}`.trim() || personUrn;

      const avatarUrl = person.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier 
        || 'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q';

      return new StreamUser(
        personUrn,
        avatarUrl,
        displayName,
        new Date(),
        'linkedin'
      );
    } catch (error) {
      console.error('Error fetching LinkedIn user:', error);
      return new StreamUser(
        personUrn,
        'https://static.licdn.com/aero-v1/sc/h/1c5u578iilxfi4m4dvc4q810q',
        personUrn,
        new Date(),
        'linkedin'
      );
    }
  }

  static async replyToComment(postUrn: string, parentCommentUrn: string, message: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/socialActions/${encodeURIComponent(postUrn)}/comments`;
      const response = await this.apiRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify({
          actor: this.personUrn,
          message: {
            text: message
          },
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
