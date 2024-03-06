import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";

const ModeWebhookBodyType = {
	"mode": { type: "string" },
	"activity": { type: "string" },
}

export const modeWebhook: RouteOptions = {
	method: "POST",
	url: "/mode",
	schema: {
		body: {
			type: "object",
			properties: ModeWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit("stream:mode", request.body);
		reply.code(200).send(true);
	},
};
