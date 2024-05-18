import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";

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
		EventBus.eventEmitter.emit(BotEvents.OnSoundEffect, request.body);
		reply.code(200).send(true);
	},
};
