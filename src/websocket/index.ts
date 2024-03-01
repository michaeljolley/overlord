import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {

		EventBus.eventEmitter.on("follow", (payload: any) => {
			connection.socket.send(JSON.stringify({ type: "follow", payload }));
		});

	});

	done();
}
