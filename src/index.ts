import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyWebSocket from "@fastify/websocket";
import { registerWebhooks } from "./webhooks/index.js";
import { registerWebsocket } from "./websocket/index.js";
import twitchChat from "./integrations/twitch/index.js";
import { TwitchAPI } from "./integrations/twitchAPI/index.js";
import cron from "./cron/index.js";
import { Logger } from "./logger/index.js";
import { UserStore } from "./stores/userStore.js";
import { LinkedInAPI } from './integrations/linkedin/index.js';
import { LiveDetector } from './integrations/linkedin/liveDetector.js';
import { CommentPoller } from './integrations/linkedin/commentPoller.js';
import { loadCommands } from './commands/registry.js';
import EventBus from './eventBus.js';
import { BotEvents } from './botEvents.js';

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
	UserStore.registerFetcher('twitch', TwitchAPI);
	
	loadCommands();
	
	if (LinkedInAPI.isConfigured()) {
		LinkedInAPI.init();
		UserStore.registerFetcher('linkedin', LinkedInAPI);
		
		EventBus.eventEmitter.on(BotEvents.OnSay, async (payload: { message: string, platform?: string, context?: { postUrn?: string, commentUrn?: string } }) => {
			if (payload.platform === 'linkedin' && payload.context?.postUrn && payload.context?.commentUrn) {
				await LinkedInAPI.replyToComment(payload.context.postUrn, payload.context.commentUrn, payload.message);
			}
		});
		
		LiveDetector.onLiveStart = (postUrn: string) => {
			console.log(`LinkedIn Live started — polling comments on ${postUrn}`);
			CommentPoller.start(postUrn);
		};
		
		LiveDetector.onLiveEnd = () => {
			console.log('LinkedIn Live ended — stopping comment polling');
			CommentPoller.stop();
		};
		
		LiveDetector.start();
		console.log('LinkedIn integration initialized');
	} else {
		console.log('LinkedIn credentials not configured — skipping LinkedIn integration');
	}
	
	Logger.init();
	twitchChat();
	cron();
});
