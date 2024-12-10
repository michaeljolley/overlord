import EventBus from "../../../eventBus";
import { ShouldThrottle } from "../shouldThrottle";
import { OnCommandEvent } from "../../../types/onCommandEvent";
import { BotEvents } from "../../../botEvents";
import SpotifyAPI from "../../spotifyAPI";

/**
 * Sends a message to chat with the currently playing song on Spotify.
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

  let message = `Ugh... this guy hasn't even authenticated with Spotify yet. 🙄`;

  // Only proceed if Spotify is authenticated
  if (SpotifyAPI.isAuthenticated()) {
    message = `Can you believe this guy is coding in silence?! The nerve! 🤮`;

    // Get the currently playing song
    const currentTrack = await SpotifyAPI.getCurrentTrack();

    if (currentTrack) {
      let url = currentTrack.url;
      let playlistMsg = '';

      if (currentTrack.playlist_url) {
        const playlist = await SpotifyAPI.getPlaylist(currentTrack.playlist_url);

        if (playlist) {
          url = playlist.url;
          playlistMsg = ` on the ${playlist.name} playlist.`;
        }
      }

      message = `We're listening to ${currentTrack.name} ${playlistMsg}. Find it at ${url}`;
    }
  }

  // Send the message to Twitch chat
  EventBus.eventEmitter.emit(BotEvents.OnSay, { message });
};