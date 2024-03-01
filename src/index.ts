import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyWebSocket from "@fastify/websocket";
import { registerWebhooks } from "./webhooks/index.js";
import { registerWebsocket } from "./websocket/index.js";

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
	fastify.listen({ port: 3000 });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
