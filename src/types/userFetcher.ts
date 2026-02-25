import { StreamUser } from './streamUser';

export interface UserFetcher {
  getUser(identifier: string): Promise<StreamUser | null>;
}
