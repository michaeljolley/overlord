import EventBus from "../../../eventBus";
import { ShouldThrottle } from "../shouldThrottle";
import { OnCommandEvent } from "../types";

/**
 * Sends a message to chat with a link to the Pally.gg tip page
 * @param onCommandEvent
 */
export const tips = (onCommandEvent: OnCommandEvent): void => {
  const cooldownSeconds = 300;

  // The broadcaster is allowed to bypass throttling. Otherwise,
  // only proceed if the command hasn't been used within the cooldown.
  if (
    !onCommandEvent.flags.broadcaster &&
    ShouldThrottle(onCommandEvent.extra.sinceLastCommand, cooldownSeconds, true)
  ) {
    return;
  }

  const message = `Toss a coin to your moderators, oh chat of plenty. All tips/donations go to our moderators. https://pally.gg/p/baldbeardedbuilder`;

  // Send the message to Twitch chat
  EventBus.eventEmitter.emit("stream:say", { message });
}
