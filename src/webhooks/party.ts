import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";

const PartyWebhookBodyType = {
	username: { type: "string" },
}

export type PartyWebhookBody = {
	username: string;
}

export const partyWebhook: RouteOptions = {
	method: "POST",
	url: "/party",
	schema: {
		body: {
			type: "object",
			properties: PartyWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: async (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit(BotEvents.OnParty,  request.body);
		reply.code(200).send(true);
	},
};
