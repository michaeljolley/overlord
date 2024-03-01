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
		const { username } = request.body as typeof FollowWebhookBodyType;
		EventBus.eventEmitter.emit("follow", { username });
		reply.code(200).send(true);
	},
};
