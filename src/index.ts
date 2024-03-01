import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import {
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from "fastify-type-provider-zod";

import { followWebhook } from "./webhooks/follow.js";

const fastify = Fastify({
	logger: true,
});
//.withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(FastifyStatic, {
	root: `${__dirname}/public`,
});

fastify.withTypeProvider<ZodTypeProvider>().route(followWebhook);

try {
	fastify.listen({ port: 3000 });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
