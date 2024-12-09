import EventBus from "../../../eventBus";
import { ShouldThrottle } from "../shouldThrottle";
import { OnCommandEvent } from "../../../types/onCommandEvent";
import { BotEvents } from "../../../botEvents";

/**
 * Sends a message to chat with a link to Michael's GitHub profile
 * @param onCommandEvent
 */
export const playlist = async (onCommandEvent: OnCommandEvent): Promise<void> => {
  const cooldownSeconds = 300;

  // The broadcaster is allowed to bypass throttling. Otherwise,
  // only proceed if the command hasn't been used within the cooldown.
  if (
    !onCommandEvent.flags.broadcaster &&
    ShouldThrottle(onCommandEvent.extra.sinceLastCommand, cooldownSeconds, true)
  ) {
    return;
  }


  // Get the currently playing playlist
  const response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
    headers: {
      'Authorization': `Bearer ${process.env.SPOTIFY_API_KEY}`
    }
  });

  const data = await response.json();

  let message = `No playlist currently playing`;

  // If the currently playing item is a playlist, send the playlist name and url
  if (data.item && data.context.type === 'playlist') {
    const playlistName = data.context.name;
    const playlistUrl = data.context.external_urls.spotify;
    
    message = `${playlistName} -> ${playlistUrl}`;
  }

  // Send the message to Twitch chat
  EventBus.eventEmitter.emit(BotEvents.OnSay, { message });
};
