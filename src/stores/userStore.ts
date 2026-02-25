import Supabase from "../integrations/supabase/index.js";
import { StreamUser } from "../types/streamUser";
import { Platform } from "../types/platform";
import { UserFetcher } from "../types/userFetcher";

const UPDATE_USER_DATA_INTERVAL_IN_DAYS = 1;

export abstract class UserStore {

	static users: Record<string, StreamUser> = {};
	static fetchers: Record<string, UserFetcher> = {};

	public static registerFetcher(platform: Platform, fetcher: UserFetcher): void {
		this.fetchers[platform] = fetcher;
	}

	public static getUser = async (login: string, platform: Platform = 'twitch'): Promise<StreamUser | null> => {
		let user: StreamUser | null = null;
		const cacheKey = `${platform}:${login}`;

		user = this.users[cacheKey];

		if (!user) {
			user = await Supabase.getUser(login, platform);
			
			if (user) {
				this.users[cacheKey] = user;
			}
		}

		if (!user ||
				!user.lastUpdated || 
				user.lastUpdated < new Date(Date.now() - 1000 * 60 * 60 * (24 * UPDATE_USER_DATA_INTERVAL_IN_DAYS))
		) {
			const fetcher = this.fetchers[platform];
			if (fetcher) {
				user = await fetcher.getUser(login);

				if (user) {
					user.lastUpdated = new Date();
					this.users[cacheKey] = user;
					await Supabase.addUser(user);
				}
			}
		}

		return user;
	}

	public static getUsersByLogins = async (logins: string[], platform: Platform = 'twitch'): Promise<StreamUser[]> => {
		const users: StreamUser[] = [];
		
		for (const login of logins) {
			const user = await this.getUser(login, platform);
			if (user) {
				users.push(user);
			}
		}

		return users;
	}
}
