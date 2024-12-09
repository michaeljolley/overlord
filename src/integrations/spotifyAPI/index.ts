export abstract class SpotifyAPI {
  private static spotifyAPIEndpoint = 'https://api.spotify.com/v1';
  private static headers: [string, string][] = [];
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;
  private static tokenExpiration: number | null = null;

  public static async init(): Promise<void> {
    if (!this.accessToken || (this.tokenExpiration && Date.now() >= this.tokenExpiration)) {
      await this.fetchAccessToken();
    }
  }

  private static async fetchAccessToken(): Promise<void> {
    const spotifyAuth = await fetch(`https://accounts.spotify.com/api/token`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials'
      }).toString()
    });

    const authData = await spotifyAuth.json();
    this.accessToken = authData.access_token;
    this.refreshToken = authData.refresh_token;
    this.tokenExpiration = Date.now() + (authData.expires_in * 1000);
    this.headers = [
      ['Authorization', `Bearer ${this.accessToken}`],
      ['Content-Type', 'application/json']
    ];
  }

  public static async getCurrentTrack(): Promise<any> {
    await this.init();
    return this.makeRequest(`${this.spotifyAPIEndpoint}/me/player/currently-playing`);
  }

  public static async getPlaylist(playListUrl: string): Promise<any> {
    await this.init();
    return this.makeRequest(playListUrl);
  }

  private static async makeRequest(url: string, retryCount: number = 0): Promise<any> {
    const response = await fetch(url, {
      method: "GET",
      headers: this.headers
    });

    if (response.status === 401 && retryCount < 2) {
      await this.refreshAccessToken();
      return this.makeRequest(url, retryCount + 1);
    }

    if (response.status === 401) {
      throw new Error("Failed to refresh access token after multiple attempts.");
    }

    const body = await response.json();
    return body;
  }

  private static async refreshAccessToken(): Promise<void> {
    const refreshAuth = await fetch(`https://accounts.spotify.com/api/token`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        'grant_type': 'refresh_token',
        'refresh_token': this.refreshToken!
      }).toString()
    });

    const authData = await refreshAuth.json();
    this.accessToken = authData.access_token;
    this.tokenExpiration = Date.now() + (authData.expires_in * 1000);
    this.headers[0] = ['Authorization', `Bearer ${this.accessToken}`];
  }
}