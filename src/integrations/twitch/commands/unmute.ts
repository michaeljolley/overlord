import { BotEvents } from "../../../botEvents";
import EventBus from "../../../eventBus";
import { OnCommandEvent } from '../../../types/onCommandEvent';

/**
 * Sends command to unmute all audio effects
 * @param onCommandEvent
 */
export const unmute = (onCommandEvent: OnCommandEvent): void => {
  // Only the broadcaster & mods should be able to unmute effects
  if (onCommandEvent.flags.broadcaster || onCommandEvent.flags.mod) {
		EventBus.eventEmitter.emit(BotEvents.OnAudioControl, { muted: false });
  }
}
