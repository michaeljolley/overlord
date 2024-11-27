
import { ShouldThrottle } from '../shouldThrottle';
import EventBus from "../../../eventBus";
import { OnCommandEvent } from '../../../types/onCommandEvent';
import { BotEvents } from '../../../botEvents';

/**
 * Sends a message to chat based on the provided command event message
 * @param onCommandEvent
 */
export const say = (onCommandEvent: OnCommandEvent): void => {
  const cooldownSeconds = 300;

  // The broadcaster is allowed to bypass throttling. Otherwise,
  // only proceed if the command hasn't been used within the cooldown.
  if (
    !onCommandEvent.flags.broadcaster &&
    ShouldThrottle(onCommandEvent.extra.sinceLastCommand, cooldownSeconds, true)
  ) {
    return;
  }

  const message = onCommandEvent.message;

  // Send the message to Twitch chat
  EventBus.eventEmitter.emit(BotEvents.OnSay, { message });
}
