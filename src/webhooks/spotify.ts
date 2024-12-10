import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import SpotifyAPI from "../integrations/spotifyAPI";

const SpotifyCallbackWebhookBodyType = {
	code: { type: "string" },
}

export const spotifyWebhook: RouteOptions = {
	method: "GET",
	url: "/spotify",
	schema: {
		querystring: {
			type: "object",
			properties: SpotifyCallbackWebhookBodyType
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: async (request: FastifyRequest, reply: FastifyReply) => {
		const { code } = request.query as { code: string };
		SpotifyAPI.exchangeAuthorizationCode(code);
		reply.code(200).send(true);
	},
};
