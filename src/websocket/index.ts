import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";
import { BotEvents } from "../botEvents";
import { CreditStore } from "../stores/creditStore";
import { UserStore } from "../stores/userStore";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {

		EventBus.eventEmitter.on(BotEvents.OnChatMessage, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnChatMessage, payload }));
			addCredit({ type: BotEvents.OnChatMessage, username: payload.user });
		});

		EventBus.eventEmitter.on(BotEvents.OnFollow, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnFollow, payload }));
			addCredit({ type: BotEvents.OnFollow, username: payload.user });
		});
		
		EventBus.eventEmitter.on(BotEvents.OnRaid, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnRaid, payload }));
			addCredit({ type: BotEvents.OnRaid, username: payload.user });
		});
		
		EventBus.eventEmitter.on(BotEvents.OnSub, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnSub, payload }));
			addCredit({ type: BotEvents.OnSub, username: payload.user });
		});
		
		EventBus.eventEmitter.on(BotEvents.OnGiftSub, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnGiftSub, payload }));
			addCredit({ type: BotEvents.OnGiftSub, username: payload.user });
		});
		
		EventBus.eventEmitter.on(BotEvents.OnCheer, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCheer, payload }));
			addCredit({ type: BotEvents.OnCheer, username: payload.username });
		});
		
		EventBus.eventEmitter.on(BotEvents.OnDonation, (payload: any) => {
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
		
		EventBus.eventEmitter.on(BotEvents.OnTriggerCredits, (payload: any) => {
			const credits = CreditStore.getCredits(); 
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
}

const addCredit = async (event: UserWebhookEvent) => {
	const user = await UserStore.getUser(event.username);

	if (user) {
		CreditStore.addCredit({
			type: event.type,
			user
		});
	}
}
