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
  const response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
    headers: {
      'Authorization': `Bearer ${process.env.SPOTIFY_API_KEY}`
    }
  });

  const data = await response.json();

  let message = `No song playing`;

  // If the currently playing item is a song, send the song name, artist, and url
  if (data.item) {
    const trackNumber = data.item.name;
    const artist = data.item.artists[0].name;
    const url = data.item.external_urls.spotify;
    
    message = `${trackNumber} - ${artist} -> ${url}`;
  }

  // Send the message to Twitch chat
  EventBus.eventEmitter.emit(BotEvents.OnSay, { message });
};
