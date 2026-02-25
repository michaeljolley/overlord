import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyWebSocket from "@fastify/websocket";
import { registerWebhooks } from "./webhooks/index.js";
import { registerWebsocket } from "./websocket/index.js";
import { registerAdminRoutes } from "./admin/linkedin.js";
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
fastify.register(registerAdminRoutes, { prefix: "/admin" });

fastify.listen({ port, host }, err => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});

TwitchAPI.init().then(() => {
	UserStore.registerFetcher('twitch', TwitchAPI);
	
	loadCommands();
	
	// Always attempt LinkedIn init — tokens may come from .linkedin-tokens.json
	// (persisted by the admin page OAuth flow) even without env vars
	const linkedInReady = LinkedInAPI.init();
	
	if (linkedInReady) {
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
		console.log('LinkedIn not fully configured — visit /admin/linkedin to connect your apps');
	}
	
	Logger.init();
	twitchChat();
	cron();
});
