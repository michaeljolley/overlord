import { TwitchAPI } from "../integrations/twitchAPI";
import { User } from "../types/user"

export abstract class UserStore {

	static users: Record<string, User> = {};

	public static getUser = async (username: string): Promise<User | undefined> => {
		let user: User | undefined = undefined;

		// Local cache of users
		user = this.users[username];

		// Twitch API lookup of users
		if (!user ||
				!user.lastUpdated || 
				user.lastUpdated < new Date(Date.now() - 1000 * 60 * 60 * 24)
		) {
			user = await TwitchAPI.getUser(username);

			if (user) {
				user.lastUpdated = new Date();
				this.users[username] = user;
			}
		}

		return user;	
	}
}
