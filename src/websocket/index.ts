import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";
import { BotEvents } from "../botEvents";
import { CreditStore } from "../stores/creditStore";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {

		EventBus.eventEmitter.on(BotEvents.OnChatMessage, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnChatMessage, payload }));
			CreditStore.addCredit({type: BotEvents.OnChatMessage, user: payload.user});
		});

		EventBus.eventEmitter.on(BotEvents.OnFollow, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnFollow, payload }));
			CreditStore.addCredit({type: BotEvents.OnFollow, user: payload.user});
		});
		
		EventBus.eventEmitter.on(BotEvents.OnRaid, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnRaid, payload }));
			CreditStore.addCredit({type: BotEvents.OnRaid, user: payload.user});
		});
		
		EventBus.eventEmitter.on(BotEvents.OnSub, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnSub, payload }));
			CreditStore.addCredit({type: BotEvents.OnSub, user: payload.user});
		});
		
		EventBus.eventEmitter.on(BotEvents.OnGiftSub, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnGiftSub, payload }));
			CreditStore.addCredit({type: BotEvents.OnGiftSub, user: payload.user});
		});
		
		EventBus.eventEmitter.on(BotEvents.OnCheer, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCheer, payload }));
			CreditStore.addCredit({type: BotEvents.OnCheer, user: payload.user});
		});
		
		EventBus.eventEmitter.on(BotEvents.OnDonation, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnDonation, payload }));
			CreditStore.addCredit({type: BotEvents.OnDonation, user: payload.user});
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
		
		EventBus.eventEmitter.on(BotEvents.OnCreditRoll, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCreditRoll, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnTriggerCredits, (payload: any) => {
			const credits = CreditStore.getCredits(); 
			EventBus.eventEmitter.emit(BotEvents.OnCreditRoll, { credits });
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
