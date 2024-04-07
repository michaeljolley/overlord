import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";

const AudioStateType = {
	muted: { type: "boolean" },
}

export const audioWebhook: RouteOptions = {
	method: "POST",
	url: "/audio",
	schema: {
		body: {
			type: "object",
			properties: AudioStateType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit("stream:audio", request.body);
		reply.code(200).send(true);
	},
};
