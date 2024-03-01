import { FastifyInstance } from "fastify";
import { followWebhook } from "./follow.js";

export function registerWebhooks(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.route(followWebhook);

	done();
}
