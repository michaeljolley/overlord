import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {

		EventBus.eventEmitter.on("twitch:follow", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "twitch:follow", payload }));
		});
		
		EventBus.eventEmitter.on("twitch:raid", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "twitch:raid", payload }));
		});
		
		EventBus.eventEmitter.on("twitch:sub", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "twitch:sub", payload }));
		});
		
		EventBus.eventEmitter.on("twitch:giftsub", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "twitch:giftsub", payload }));
		});
		
		EventBus.eventEmitter.on("twitch:cheer", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "twitch:cheer", payload }));
		});
		
		EventBus.eventEmitter.on("twitch:donation", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "twitch:donation", payload }));
		});
		
		EventBus.eventEmitter.on("stream:mode", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "stream:mode", payload }));
		});
		
		EventBus.eventEmitter.on("stream:audio", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "stream:audio", payload }));
		});

	});

	done();
}
