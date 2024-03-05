import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";

const GiftSubWebhookBodyType = {
	username: { type: "string" },
	giftedTotal: { type: "number" },
}

export const giftedSubWebhook: RouteOptions = {
	method: "POST",
	url: "/giftsub",
	schema: {
		body: {
			type: "object",
			properties: GiftSubWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit("twitch:giftsub",  request.body);
		reply.code(200).send(true);
	},
};
