
import { Platform } from './platform';

export class StreamUser {
  constructor(
    public login: string,
    public avatar_url: string,
    public display_name?: string,
    public lastUpdated?: Date,
    public platform: Platform = 'twitch',
  ) { }
}
