import EventBus from "../../../eventBus";
import { ShouldThrottle } from "../shouldThrottle";
import { OnCommandEvent } from '../../../types/onCommandEvent';
import { BotEvents } from "../../../botEvents";

/**
 * Sends a message to chat with info on Microsoft PowerToys.
 * @param onCommandEvent
 */
export const powertoys = (onCommandEvent: OnCommandEvent): void => {
  const cooldownSeconds = 300;

  // The broadcaster is allowed to bypass throttling. Otherwise,
  // only proceed if the command hasn't been used within the cooldown.
  if (
    !onCommandEvent.flags.broadcaster &&
    ShouldThrottle(onCommandEvent.extra.sinceLastCommand, cooldownSeconds, true)
  ) {
    return;
  }

  const message = `Learn more about Microsoft PowerToys, a set of utilities for power users to tune and streamline their Windows experience: https://bbb.dev/pt`;

  // Send the message to Twitch chat
  EventBus.eventEmitter.emit(BotEvents.OnSay, { message });
}
