import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";

export const creditsWebhook: RouteOptions = {
	method: "GET",
	url: "/credits",
	schema: {
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: async (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit(BotEvents.OnTriggerCredits,  request.body);
		reply.code(200).send(true);
	},
};
