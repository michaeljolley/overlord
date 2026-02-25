import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const TOKEN_FILE = join(process.cwd(), '.linkedin-tokens.json');

interface AppTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

interface LinkedInTokenStore {
  general: AppTokens;
  community_management: AppTokens;
  person_urn?: string;
}

export function loadTokens(): LinkedInTokenStore | null {
  try {
    if (!existsSync(TOKEN_FILE)) {
      return null;
    }
    const data = readFileSync(TOKEN_FILE, 'utf-8');
    return JSON.parse(data) as LinkedInTokenStore;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: LinkedInTokenStore): void {
  try {
    writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log('LinkedIn tokens saved to .linkedin-tokens.json');
  } catch (error) {
    console.error('Failed to save LinkedIn tokens:', error);
  }
}
