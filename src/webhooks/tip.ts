import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";

const TipWebhookBodyType = {
	"campaignTip": {type: "object"}
}

export type TipWebhookBody = {
	campaignTip: {
		amount: number;
		message: string;
	};
}

export const tipWebhook: RouteOptions = {
	method: "POST",
	url: "/tip",
	schema: {
		body: {
			type: "object",
			properties: TipWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit(BotEvents.OnDonation, request.body);
		reply.code(200).send(true);
	},
};
