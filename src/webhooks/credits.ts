import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";

const CreditsWebhookBodyType = {
	streamDate: { type: "string" }
}

export type CreditsWebhookBody = {
	streamDate: string;
}

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
		const streamDate = new Date().toISOString().split('T')[0];
		EventBus.eventEmitter.emit(BotEvents.OnTriggerCredits,  { streamDate });
		reply.code(200).send(true);
	},
};

// For testing purposes
export const creditsPOSTWebhook: RouteOptions = {
	method: "POST",
	url: "/credits",
	schema: {
		body: {
			type: "object",
			properties: CreditsWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: async (request: FastifyRequest, reply: FastifyReply) => {
		const body = request.body as CreditsWebhookBody;
		const streamDate = new Date(body.streamDate).toISOString().split('T')[0];
		EventBus.eventEmitter.emit(BotEvents.OnTriggerCredits,  { streamDate });
		reply.code(200).send(true);
	},
};
