import EventBus from "../../../eventBus";
import { ShouldThrottle } from "../shouldThrottle";
import { OnCommandEvent } from "../../../types/onCommandEvent";
import { BotEvents } from "../../../botEvents";

/**
 * Sends a message to chat with a link to Michael's GitHub profile
 * @param onCommandEvent
 */
export const music = async (onCommandEvent: OnCommandEvent): Promise<void> => {
  const cooldownSeconds = 300;

  // The broadcaster is allowed to bypass throttling. Otherwise,
  // only proceed if the command hasn't been used within the cooldown.
  if (
    !onCommandEvent.flags.broadcaster &&
    ShouldThrottle(onCommandEvent.extra.sinceLastCommand, cooldownSeconds, true)
  ) {
    return;
  }

  // Get the currently playing song
  const response = await spotifyAPI(`https://api.spotify.com/v1/me/player/currently-playing`);

  let message = `Can you believe this guy is coding in silence?! The nerve! 🤮`;

  if (response.ok) {
    const data = await response.json();

    // If the currently playing item is a song, send the song name, artist, and url
    if (data.item) {
      const trackName = data.item.name;
      //const artist = data.item.artists[0].name;
      let url = data.item.external_urls.spotify;
			
			let playlist = '';
			if (data.context.type === 'playlist') {
  			const playlistResponse = await spotifyAPI(data.context.href);
				if (playlistResponse.ok) {
					const playlistData = await playlistResponse.json();
					playlist = ` on the ${playlistData.name} playlist.`;
					url = playlistData.external_urls.spotify;
				}
			}

      message = `We're listening to ${trackName} ${playlist}. Find it at ${url}`;
    }
  }

  // Send the message to Twitch chat
  EventBus.eventEmitter.emit(BotEvents.OnSay, { message });
};

const spotifyAPI = (path: string) => {
	return fetch(path, {
		headers: {
      'Authorization': `Bearer ${process.env.SPOTIFY_API_KEY}`
    }
	});
}
