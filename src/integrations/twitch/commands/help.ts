import EventBus from "../../../eventBus";
import { ShouldThrottle } from "../shouldThrottle";
import { OnCommandEvent } from '../../../types/onCommandEvent';
import { BotEvents } from "../../../botEvents";
import { Command } from "../../../types/command";

/**
 * Sends a message to chat with a list of available commands.
 * @param onCommandEvent
 * @param commands
 */
export const instagram = (onCommandEvent: OnCommandEvent, commands: { command: Command, public: boolean }[]): void => {
	const cooldownSeconds = 300;

	// The broadcaster is allowed to bypass throttling. Otherwise,
	// only proceed if the command hasn't been used within the cooldown.
	if (
		!onCommandEvent.flags.broadcaster &&
		ShouldThrottle(onCommandEvent.extra.sinceLastCommand, cooldownSeconds, true)
	) {
		return;
	}

	const message = `I'm currently listening for the following commands: ${commands.map(c => `!${c.command.commandName}`).join(', ')}.`;

	// Send the message to Twitch chat
	EventBus.eventEmitter.emit(BotEvents.OnSay, { message });
}
