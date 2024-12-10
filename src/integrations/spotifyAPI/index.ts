import { SpotifyPlaylist, SpotifyTrack } from '../../types/spotify';

export default abstract class SpotifyAPI {
	private static spotifyAPIAuthEndpoint =
		'https://accounts.spotify.com/api/token';
	private static spotifyAPIEndpoint = 'https://api.spotify.com/v1';
	private static redirectUri: string | null = null;
	private static headers: [string, string][] = [];
	private static accessToken: string | null = null;
	private static refreshToken: string | null = null;
	private static authHeaders = {
		'Content-Type': 'application/x-www-form-urlencoded',
		Authorization: `Basic ${btoa(
			`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
		)}`,
	};

	public static isAuthenticated = () => this.accessToken !== null;

	public static getAuthorizationUrl(host: string, port: number): void {
		this.redirectUri = `http://${host}:${port}/webhooks/spotify`;

		const clientId = process.env.SPOTIFY_CLIENT_ID;
		const redirectUri = encodeURIComponent(this.redirectUri);
		const scope = encodeURIComponent('user-read-currently-playing');
		const spotifyCallbackUri = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

		console.log(`Authenticate with the Spotify API: ${spotifyCallbackUri}`);
	}

	public static async exchangeAuthorizationCode(code: string): Promise<void> {
		const response = await fetch(this.spotifyAPIAuthEndpoint, {
			method: 'POST',
			headers: this.authHeaders,
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code: code,
				redirect_uri: this.redirectUri!,
			}).toString(),
		});

		if (!response.ok) {
			console.log(
				`Spotify API returned a ${response.status} ${response.statusText} status when exchanging code.`
			);
			return;
		}

		const authData = await response.json();
		this.accessToken = authData.access_token;
		this.refreshToken = authData.refresh_token;
		this.headers = [
			['Authorization', `Bearer ${this.accessToken}`],
			['Content-Type', 'application/json'],
		];

		console.log('Successfully authenticated with Spotify API.');
	}

	private static async refreshAccessToken(): Promise<void> {
		const response = await fetch(`${this.spotifyAPIAuthEndpoint}/token`, {
			method: 'POST',
			headers: this.authHeaders,
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: this.refreshToken!,
			}).toString(),
		});

		const authData = await response.json();
		this.accessToken = authData.access_token;
		this.headers[0] = ['Authorization', `Bearer ${this.accessToken}`];
	}

	public static async getCurrentTrack(): Promise<SpotifyTrack | undefined> {
		if (!this.isAuthenticated()) {
			return undefined;
		}
		return this.makeRequest(
			'TRACK',
			`${this.spotifyAPIEndpoint}/me/player/currently-playing`
		);
	}

	public static async getPlaylist(
		playListUrl: string
	): Promise<SpotifyPlaylist | undefined> {
		return this.makeRequest('PLAYLIST', playListUrl);
	}

	private static async makeRequest(
		payload: 'TRACK' | 'PLAYLIST',
		url: string,
		retryCount: number = 0
	): Promise<SpotifyTrack | SpotifyPlaylist | undefined> {
		const response = await fetch(url, {
			method: 'GET',
			headers: this.headers,
		});

		if (response.status === 401 && retryCount < 2) {
			await this.refreshAccessToken();
			return this.makeRequest(payload, url, retryCount + 1);
		}

		if (response.status === 401) {
			console.log('Failed to refresh access token after multiple attempts.');
		}

		if (response.ok) {
			const body = await response.json();
			switch (payload) {
				case 'TRACK':
					return {
						name: body.item.name,
						url: body.item.external_urls.spotify,
						playlist_url:
							body.context.type === 'playlist' ? body.context.href : undefined,
					};
				case 'PLAYLIST':
					return {
						name: body.name,
						url: body.external_urls.spotify,
					};
			}
		}
		return undefined;
	}
}
