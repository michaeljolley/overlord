import Fastify from 'fastify';
import ComfyJS from 'comfy.js';
import { onPart } from './handlers/onPart';
import { onJoin } from './handlers/onJoin';
import { LogArea, LogLevel, log } from '@shared/log';

const fastify = Fastify({
  logger: true,
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    log(LogLevel.Error, LogArea.Chat, `Fastify: Error starting server. ${err}`)
    process.exit(1);
  }
  log(LogLevel.Info, LogArea.Chat, `Fastify: Server started on ${address}`);
});


ComfyJS.onPart = onPart;
ComfyJS.onJoin = onJoin;


ComfyJS.Init(
  process.env.TWITCH_BOT_USERNAME as string,
  process.env.TWITCH_BOT_AUTH_TOKEN,
  process.env.TWITCH_CHANNEL
);


