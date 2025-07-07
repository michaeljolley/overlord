import EventBus from "../../../eventBus";
import { BotEvents } from "../../../botEvents";
import { OnChatMessageEvent } from "../../../types/onChatMessageEvent";
import { ShouldThrottleTrigger } from "../shouldThrottleTrigger";

let sinceLastBlazorTrigger: Date | null = null;

/**
 * Responds to people saying 'blazor' in Twitch chat.
 * @param onChatMessageEvent
 */
export const blazor = (onChatMessageEvent: OnChatMessageEvent): void => {
	const cooldownSeconds = 300;

	if (ShouldThrottleTrigger(sinceLastBlazorTrigger, cooldownSeconds, false)) {
		return;
	}

	sinceLastBlazorTrigger = new Date();

	const username = onChatMessageEvent.user.display_name || onChatMessageEvent.user.login;
	
	EventBus.eventEmitter.emit(BotEvents.OnBlazor, { username });
}
