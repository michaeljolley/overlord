import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";
import { BotEvents } from "../botEvents";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {

		EventBus.eventEmitter.on(BotEvents.OnChatMessage, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnChatMessage, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnFollow, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnFollow, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnRaid, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnRaid, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnSub, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnSub, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnGiftSub, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnGiftSub, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnCheer, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCheer, payload }));
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
		
		EventBus.eventEmitter.on(BotEvents.OnCreditRoll, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCreditRoll, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnTodoUpdated, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnTodoUpdated, payload }));
		});
	});

	done();
}
