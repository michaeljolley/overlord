import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";

const FollowWebhookBodyType = {
	username: { type: "string" },
	profileImageUrl: { type: "string" },
}

export const followWebhook: RouteOptions = {
	method: "POST",
	url: "/follow",
	schema: {
		body: {
			type: "object",
			properties: FollowWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit(BotEvents.OnFollow, request.body);
		reply.code(200).send(true);
	},
};
