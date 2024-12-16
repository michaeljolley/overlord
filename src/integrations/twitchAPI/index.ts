import { Stream } from "../../types/stream";
import { User } from "../../types/user"

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID as string;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET as string;
const TWITCH_CHANNEL_ID = process.env.TWITCH_CHANNEL_ID as string;

export abstract class TwitchAPI {
	
  private static twitchAPIEndpoint = 'https://api.twitch.tv/helix'
  private static twitchAPIUserEndpoint = `${this.twitchAPIEndpoint}/users`
  private static twitchAPIStreamEndpoint = `${this.twitchAPIEndpoint}/streams`
  private static twitchAPISubscriptionsEndpoint = `${this.twitchAPIEndpoint}/subscriptions`

  private static headers: [string, string][] = []

	public static async init(): Promise<void> {

		const twitchAuth = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
			{
				method: "POST",
			});
		
		const twitchAuthToken = (await twitchAuth.json()).access_token;

    this.headers = [
      ['Authorization', `Bearer ${twitchAuthToken}`],
      ['Content-Type', 'application/json'],
      ['Client-ID', TWITCH_CLIENT_ID]
		]
  }
	
	 /**
   * Retrieves data regarding a Twitch user from the Twitch API
   * @param login username of the user to retrieve
   */
	 public static async getUser(login: string): Promise<User | undefined> {
    const url = `${this.twitchAPIUserEndpoint}?login=${login}`
    let user: User | undefined;

		try {
			const response = await fetch(url, { 
				method: "GET",
				headers: this.headers }
			);
	
			const body = await response.json();
			const userData = body.data.length > 1 ? body.data : body.data[0];
			if (userData) {
				user = new User(userData.login, userData.profile_image_url, userData.id, userData.display_name);
			}
		}
		catch (error) {
			console.error(error);
		}

    return user;
  }

  public static async getStream(streamDate: string): Promise<Stream | undefined> {
    const url = `${this.twitchAPIStreamEndpoint}?user_id=${TWITCH_CHANNEL_ID}&first=1`

    let stream: Stream | undefined;

		try {
			const response = await fetch(url, { 
				method: "GET",
				headers: this.headers }
			);
	
			const body = await response.json();
			const streamData = body.data.length > 1 ? body.data : body.data[0];
			if (streamData) {
				stream = new Stream(streamData.id, streamDate);
			}
		}
		catch (error) {
			console.error(error);
		}

		return stream
  }

  public static async getSubscriptions(): Promise<string[] | undefined> {
    const url = `${this.twitchAPISubscriptionsEndpoint}?broadcaster_id=${TWITCH_CHANNEL_ID}`

    let subscribers: string[] = [];

		try {
			const response = await fetch(url, { 
				method: "GET",
				headers: this.headers }
			);

			if (response.ok) {
				const body = await response.json();
				const subData = body.data.length > 1 ? body.data : body.data[0];
				if (subData) {
					subscribers = subData.map((sub: any) => sub.user_name);
				}
			} else {
				console.error(`Error fetching subscriptions: ${response.statusText}`);
			}
		}
		catch (error) {
			console.error(error);
		}

		return subscribers
  }

}
