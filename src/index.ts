import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyWebSocket from "@fastify/websocket";
import { registerWebhooks } from "./webhooks/index.js";
import { registerWebsocket } from "./websocket/index.js";

const host = process.argv[2] || "Mac-Studio.bbq";
const port = process.argv[3] ? parseInt(process.argv[3]) : 3000;

const fastify = Fastify({
	logger: true,
});

fastify.register(FastifyWebSocket);
fastify.register(registerWebsocket);

fastify.register(FastifyStatic, {
	root: `${__dirname}/public`,
});

fastify.register(registerWebhooks, { prefix: "/webhooks" });

try {
	fastify.listen({ port, host });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
