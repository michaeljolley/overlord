import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";

const RaidWebhookBodyType = {
	username: { type: "string" },
	viewers: { type: "number" },
}

export const raidWebhook: RouteOptions = {
	method: "POST",
	url: "/raid",
	schema: {
		body: {
			type: "object",
			properties: RaidWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit("twitch:raid", request.body);
		reply.code(200).send(true);
	},
};
