import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";

export const iconResetWebhook: RouteOptions = {
	method: "POST",
	url: "/icon/reset",
	schema: {
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		EventBus.eventEmitter.emit("stream:icon:reset");
		reply.code(200).send(true);
	},
};
