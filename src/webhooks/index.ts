import { FastifyInstance } from "fastify";
import { audioWebhook } from "./audio.js";
import { cheerWebhook } from "./cheer.js";
import { followWebhook } from "./follow.js";
import { giftedSubWebhook } from "./giftsub.js";
import { modeWebhook } from "./mode.js";
import { partyWebhook } from "./party.js";
import { raidWebhook } from "./raid.js";
import { spotifyWebhook } from "./spotify.js";
import { subWebhook } from "./sub.js";
import { tipWebhook } from "./tip.js";

export function registerWebhooks(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.route(audioWebhook);
	fastify.route(cheerWebhook);
	fastify.route(followWebhook);
	fastify.route(giftedSubWebhook);
	fastify.route(modeWebhook);
	fastify.route(partyWebhook);
	fastify.route(raidWebhook);
	fastify.route(spotifyWebhook);
	fastify.route(subWebhook);
	fastify.route(tipWebhook);

	done();
}
