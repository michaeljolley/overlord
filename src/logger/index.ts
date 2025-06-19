import { BotEvents } from "../botEvents";
import EventBus from "../eventBus";
import Supabase from "../integrations/supabase";
import { UserStore } from "../stores/userStore";
import { CreditRoll } from "../types/creditRoll";
import { OnChatMessageEvent } from "../types/onChatMessageEvent";
import { StreamEvent } from "../types/streamEvent";
import { CheerWebhookBody } from "../webhooks/cheer";
import { CreditsWebhookBody } from "../webhooks/credits";
import { FollowWebhookBody } from "../webhooks/follow";
import { GiftSubWebhookBody } from "../webhooks/giftsub";
import { RaidWebhookBody } from "../webhooks/raid";
import { SubWebhookBody } from "../webhooks/sub";

export abstract class Logger {

	public static init() {
		
		EventBus.eventEmitter.on(BotEvents.OnChatMessage, async (payload: OnChatMessageEvent) => {
			await this.logEvent({ type: BotEvents.OnChatMessage, username: payload.user.login, message: payload.message });
		});

		EventBus.eventEmitter.on(BotEvents.OnFollow, async (payload: FollowWebhookBody) => {
			await this.logEvent({ type: BotEvents.OnFollow, username: payload.username });
		});

		EventBus.eventEmitter.on(BotEvents.OnRaid, async (payload: RaidWebhookBody) => {
			await this.logEvent({ type: BotEvents.OnRaid, username: payload.username });
		});

		EventBus.eventEmitter.on(BotEvents.OnSub, async (payload: SubWebhookBody) => {
			await this.logEvent({ type: BotEvents.OnSub, username: payload.username, message: payload.message });
		});

		EventBus.eventEmitter.on(BotEvents.OnGiftSub, async (payload: GiftSubWebhookBody) => {
			await this.logEvent({ type: BotEvents.OnGiftSub, username: payload.username });
		});

		EventBus.eventEmitter.on(BotEvents.OnCheer, async (payload: CheerWebhookBody) => {
			await this.logEvent({ type: BotEvents.OnCheer, username: payload.username, message: payload.message });
		});

		EventBus.eventEmitter.on(BotEvents.OnTriggerCredits, async (payload: CreditsWebhookBody) => {
			const credits = await this.getCredits(payload.streamDate);
			EventBus.eventEmitter.emit(BotEvents.OnCreditRoll, { credits });
		});
	}

	private static async logEvent(event: UserWebhookEvent) : Promise<void> {
		try {
			const { type, username, message } = event;

			// Ensure user exists in cache/db
			await UserStore.getUser(username);

			const streamEvent: StreamEvent = {
				streamDate: new Date().toISOString().split("T")[0],
				login: username,
				created_at: new Date(),
				eventType: type,
				message
			};
			
			await Supabase.addStreamEvent(streamEvent);
		} catch (error) {
			console.error("Error logging event: ", error);
		}
	}

	private static async getCredits(streamDate: string) : Promise<CreditRoll[]> {
		const credits: CreditRoll[] = [];

		const streamEvents = await Supabase.getStreamEvents(streamDate);

		const types = streamEvents.reduce((acc: string[], event) => {
			if (!acc.includes(event.eventType)) {
				acc.push(event.eventType);
			}
			return acc;
		}, []);

		for (const type of types) {
			const logins = streamEvents
				.filter((event) => event.eventType === type)
				.map((event) => event.login)
				.reduce((acc: string[], login) => {
					if (!acc.includes(login)) {
						acc.push(login);
					}
					return acc;
				}, []);
			
			const users = await UserStore.getUsersByLogins(logins);

			if (users.length > 0) {
				credits.push({
					type,
					users
				});
			}
		}
		return credits;
	}
}

interface UserWebhookEvent {
	type: string;
	username: string;
	message?: string;
}
