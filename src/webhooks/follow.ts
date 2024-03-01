import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import z from "zod";

const FollowWebhookBody = z.object({
	username: z.string(),
});

export const followWebhook: RouteOptions = {
	method: "POST",
	url: "/webhooks/follow",
	schema: {
		body: {
			type: FollowWebhookBody,
		},
		response: {
			200: {
				type: "object",
				properties: z.object({
					username: z.string(),
					message: z.string(),
				}),
			},
		},
	},
	handler: (request: FastifyRequest, reply: FastifyReply) => {
		const { username } = request.body as typeof FollowWebhookBody.shape;

		reply.code(200).send({ username, message: "Thanks for following!" });
	},
};
