import { FastifyInstance } from "fastify";
import { followWebhook } from "./follow.js";
import { cheerWebhook } from "./cheer.js";
import { giftedSubWebhook } from "./giftsub.js";
import { raidWebhook } from "./raid.js";
import { subWebhook } from "./sub.js";

export function registerWebhooks(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.route(followWebhook);
	fastify.route(cheerWebhook);
	fastify.route(giftedSubWebhook);
	fastify.route(raidWebhook);
	fastify.route(subWebhook);

	done();
}
