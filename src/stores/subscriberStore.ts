import { TwitchAPI } from "../integrations/twitchAPI";

export abstract class SubscriberStore {

	static users: string[] = [];

	public static isSubscriber = async (username: string): Promise<boolean> => {

		if (this.users.length === 0) {
			await this.loadSubscribers();
		}

		return this.users.includes(username);
	}

	public static loadSubscribers = async () => {
		const subs = await TwitchAPI.getSubscriptions();
		if (subs) {
			this.users = subs;
		}
	}
}
