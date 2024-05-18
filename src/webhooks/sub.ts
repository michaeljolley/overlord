import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";

const SubWebhookBodyType = {
	username: { type: "string" },
	message: { type: "string" },
}

export const subWebhook: RouteOptions = {
	method: "POST",
	url: "/sub",
	schema: {
		body: {
			type: "object",
			properties: SubWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit(BotEvents.OnSub, request.body);
		reply.code(200).send(true);
	},
};
