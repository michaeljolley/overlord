import Supabase from "../integrations/supabase";
import { TwitchAPI } from "../integrations/twitchAPI";
import { User } from "../types/user"

const UPDATE_USER_DATA_INTERVAL_IN_DAYS = 1; // Update user data every 1 day

export abstract class UserStore {

	static users: Record<string, User> = {};

	public static getUser = async (login: string): Promise<User | null> => {
		let user: User | null = null;

		// Local cache of users
		user = this.users[login];

		// If not in local cache, check Supabase
		// This is to avoid hitting the Twitch API too often
		if (!user) {
			user = await Supabase.getUser(login);
			
			// Add user to local cache
			if (user) {
				this.users[login] = user;
			}
		}

		// If not in local cache or Supabase or if it needs to be updated,
		// fetch from Twitch API
		if (!user ||
				!user.lastUpdated || 
				user.lastUpdated < new Date(Date.now() - 1000 * 60 * 60 * (24 * UPDATE_USER_DATA_INTERVAL_IN_DAYS))
		) {
			user = await TwitchAPI.getUser(login);

			// If we received a user from Twitch API, update the local cache 
			// and Supabase
			if (user) {
				user.lastUpdated = new Date();

				this.users[login] = user;
				await Supabase.addUser(user);
			}
		}

		return user;
	}

	public static getUsersByLogins = async (logins: string[]): Promise<User[]> => {
		const users: User[] = [];
		
		for (const login of logins) {
			const user = await this.getUser(login);
			if (user) {
				users.push(user);
			}
		}

		return users;
	}
}
