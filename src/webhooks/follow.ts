import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";

const FollowWebhookBodyType = {
	username: { type: "string" },
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
		EventBus.eventEmitter.emit("twitch:follow", request.body);
		reply.code(200).send(true);
	},
};
