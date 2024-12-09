import { FastifyInstance } from "fastify";
import { followWebhook } from "./follow.js";
import { cheerWebhook } from "./cheer.js";
import { giftedSubWebhook } from "./giftsub.js";
import { raidWebhook } from "./raid.js";
import { subWebhook } from "./sub.js";
import { modeWebhook } from "./mode.js";
import { partyWebhook } from "./party.js";
import { tipWebhook } from "./tip.js";
import { audioWebhook } from "./audio.js";

export function registerWebhooks(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.route(audioWebhook);
	fastify.route(followWebhook);
	fastify.route(cheerWebhook);
	fastify.route(partyWebhook);
	fastify.route(giftedSubWebhook);
	fastify.route(raidWebhook);
	fastify.route(subWebhook);
	fastify.route(modeWebhook);
	fastify.route(tipWebhook);

	done();
}
