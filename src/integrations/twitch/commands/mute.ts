import { BotEvents } from "../../../botEvents";
import EventBus from "../../../eventBus";
import { OnCommandEvent } from '../../../types/onCommandEvent';

/**
 * Sends command to mute all audio effects
 * @param onCommandEvent
 */
export const mute = (onCommandEvent: OnCommandEvent): void => {
  // Only the broadcaster & mods should be able to mute effects
  if (onCommandEvent.flags.broadcaster || onCommandEvent.flags.mod) {
		EventBus.eventEmitter.emit(BotEvents.OnAudioControl, { muted: true });
  }
}
