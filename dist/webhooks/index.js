import { followWebhook } from "./follow.js";
import { cheerWebhook } from "./cheer.js";
import { giftedSubWebhook } from "./giftsub.js";
import { raidWebhook } from "./raid.js";
import { subWebhook } from "./sub.js";
import { modeWebhook } from "./mode.js";
import { iconIncrementWebhook } from "./iconIncrement.js";
import { iconResetWebhook } from "./iconReset.js";
export function registerWebhooks(fastify, _, done) {
    fastify.route(followWebhook);
    fastify.route(cheerWebhook);
    fastify.route(giftedSubWebhook);
    fastify.route(raidWebhook);
    fastify.route(subWebhook);
    fastify.route(modeWebhook);
    fastify.route(iconIncrementWebhook);
    fastify.route(iconResetWebhook);
    done();
}
