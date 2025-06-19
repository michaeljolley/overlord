import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";
import { BotEvents } from "../botEvents";
import { UserStore } from "../stores/userStore";
import { StreamEvent } from "../types/streamEvent";
import Supabase from "../integrations/supabase";
import { CreditRoll } from "../types/creditRoll";
import { OnChatMessageEvent } from "../types/onChatMessageEvent";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {

		EventBus.eventEmitter.on(BotEvents.OnChatMessage, (payload: OnChatMessageEvent) => {
			logEvent({ type: BotEvents.OnChatMessage, username: payload.user.login, message: payload.message })
				.then(() => connection.socket.send(JSON.stringify({ type: BotEvents.OnChatMessage, payload })));
		});

		EventBus.eventEmitter.on(BotEvents.OnFollow, (payload: any) => {
			logEvent({ type: BotEvents.OnFollow, username: payload.username })
				.then(() => connection.socket.send(JSON.stringify({ type: BotEvents.OnFollow, payload })));
		});

		EventBus.eventEmitter.on(BotEvents.OnRaid, (payload: any) => {
			logEvent({ type: BotEvents.OnRaid, username: payload.username })
				.then(() => connection.socket.send(JSON.stringify({ type: BotEvents.OnRaid, payload })));
		});

		EventBus.eventEmitter.on(BotEvents.OnSub, (payload: any) => {
			logEvent({ type: BotEvents.OnSub, username: payload.username, message: payload.message })
				.then(() => connection.socket.send(JSON.stringify({ type: BotEvents.OnSub, payload })));
		});

		EventBus.eventEmitter.on(BotEvents.OnGiftSub, (payload: any) => {
			logEvent({ type: BotEvents.OnGiftSub, username: payload.username })
				.then(() => connection.socket.send(JSON.stringify({ type: BotEvents.OnGiftSub, payload })));
		});

		EventBus.eventEmitter.on(BotEvents.OnCheer, (payload: any) => {
			logEvent({ type: BotEvents.OnCheer, username: payload.username, message: payload.message })
				.then(() => connection.socket.send(JSON.stringify({ type: BotEvents.OnCheer, payload })));
		});

		EventBus.eventEmitter.on(BotEvents.OnDonation, (payload: any) => {
			logEvent({ type: BotEvents.OnDonation, username: payload.username })
				.then(() => connection.socket.send(JSON.stringify({ type: BotEvents.OnDonation, payload })));
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
		
		EventBus.eventEmitter.on(BotEvents.OnTriggerCredits, (payload: any) => {
			const credits = getCredits(); 
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCreditRoll, payload: credits }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnTodoUpdated, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnTodoUpdated, payload }));
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
	console.dir(event, { depth: null });
	const { type, username, message } = event;
	const streamEvent: StreamEvent = {
		streamDate: new Date().toISOString().split("T")[0],
		login: username,
		created_at: new Date(),
		eventType: type,
		message
	};
	await Supabase.addStreamEvent(streamEvent);
}

async function getCredits() : Promise<CreditRoll[]> {
	const credits: CreditRoll[] = [];

	const streamEvents = await Supabase.getStreamEvents(new Date().toISOString().split("T")[0]);

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
