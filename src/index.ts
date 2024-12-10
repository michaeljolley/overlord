import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyWebSocket from "@fastify/websocket";
import { registerWebhooks } from "./webhooks/index.js";
import { registerWebsocket } from "./websocket/index.js";
import pallygg from "./integrations/pallygg/index.js";
import twitchChat from "./integrations/twitch/index.js";
import { TwitchAPI } from "./integrations/twitchAPI/index.js";
import cron from "./cron/index.js";
import SpotifyAPI from "./integrations/spotifyAPI/index.js";

const host = process.argv[2] || "Mac-Studio.bbq";
const port = process.argv[3] ? parseInt(process.argv[3]) : 3000;

const fastify = Fastify({
	logger: true,
});

fastify.register(FastifyWebSocket);
fastify.register(registerWebsocket);

fastify.register(FastifyStatic, {
	root: `${__dirname}/web`,
});

fastify.register(registerWebhooks, { prefix: "/webhooks" });

try {
	fastify.listen({ port, host });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}

TwitchAPI.init().then(() => {
	pallygg();
	twitchChat();
    cron().then(() => {});
	SpotifyAPI.getAuthorizationUrl(host, port);
});
