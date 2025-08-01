import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyWebSocket from "@fastify/websocket";
import { registerWebhooks } from "./webhooks/index.js";
import { registerWebsocket } from "./websocket/index.js";
import twitchChat from "./integrations/twitch/index.js";
import { TwitchAPI } from "./integrations/twitchAPI/index.js";
import cron from "./cron/index.js";
import { Logger } from "./logger/index.js";

const host = process.argv[2] || "localhost";
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

fastify.listen({ port, host }, err => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});

TwitchAPI.init().then(() => {
	Logger.init();
	twitchChat();
	cron();
});
