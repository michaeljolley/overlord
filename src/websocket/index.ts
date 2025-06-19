import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";
import { BotEvents } from "../botEvents";
import { UserStore } from "../stores/userStore";
import { StreamEvent } from "../types/streamEvent";
import Supabase from "../integrations/supabase";
import { CreditRoll } from "../types/creditRoll";
import { OnChatMessageEvent } from "../types/onChatMessageEvent";
import { FollowWebhookBody } from "../webhooks/follow";
import { RaidWebhookBody } from "../webhooks/raid";
import { SubWebhookBody } from "../webhooks/sub";
import { GiftSubWebhookBody } from "../webhooks/giftsub";
import { CheerWebhookBody } from "../webhooks/cheer";
import { TipWebhookBody } from "../webhooks/tip";
import { CreditsWebhookBody } from "../webhooks/credits";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {
		
		EventBus.eventEmitter.on(BotEvents.OnChatMessage, async (payload: OnChatMessageEvent) => {
			await logEvent({ type: BotEvents.OnChatMessage, username: payload.user.login, message: payload.message });
			connection.socket.send(JSON.stringify({ type: BotEvents.OnChatMessage, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnFollow, async (payload: FollowWebhookBody) => {
			await logEvent({ type: BotEvents.OnFollow, username: payload.username });
			connection.socket.send(JSON.stringify({ type: BotEvents.OnFollow, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnRaid, async (payload: RaidWebhookBody) => {
			await logEvent({ type: BotEvents.OnRaid, username: payload.username });
			connection.socket.send(JSON.stringify({ type: BotEvents.OnRaid, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnSub, async (payload: SubWebhookBody) => {
			await logEvent({ type: BotEvents.OnSub, username: payload.username, message: payload.message });
			connection.socket.send(JSON.stringify({ type: BotEvents.OnSub, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnGiftSub, async (payload: GiftSubWebhookBody) => {
			await logEvent({ type: BotEvents.OnGiftSub, username: payload.username });
			connection.socket.send(JSON.stringify({ type: BotEvents.OnGiftSub, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnCheer, async (payload: CheerWebhookBody) => {
			await logEvent({ type: BotEvents.OnCheer, username: payload.username, message: payload.message });
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCheer, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnDonation, async (payload: TipWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnDonation, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnStreamMode, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnStreamMode, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnAudioControl, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnAudioControl, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnSoundEffect, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnSoundEffect, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnTriggerCredits, async (payload: CreditsWebhookBody) => {
			const credits = await getCredits(payload.streamDate);
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCreditRoll, payload: credits }));
		});
		
		EventBus.eventEmitter.on(BotEvents.Announcement, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.Announcement, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnParty, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnParty, payload }));
		});
	});

	done();
}

interface UserWebhookEvent {
	type: string;
	username: string;
	message?: string;
}

async function logEvent(event: UserWebhookEvent) : Promise<void> {
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

async function getCredits(streamDate: string) : Promise<CreditRoll[]> {
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
			.map((event) => event.login);
		
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
