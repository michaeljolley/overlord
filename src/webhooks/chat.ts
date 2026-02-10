import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import EventBus from "../eventBus";
import { BotEvents } from "../botEvents";
import { OnChatMessageEvent } from "../types/onChatMessageEvent";
import { StreamUser } from "../types/streamUser";

const ChatWebhookBodyType = {
	username: { type: "string" },
	displayName: { type: "string" },
	message: { type: "string" },
	profileImageUrl: { type: "string" },
	mod: { type: "boolean" },
	vip: { type: "boolean" },
	highlighted: { type: "boolean" },
	subscriber: { type: "boolean" },
}

export type ChatWebhookBody = {
	username: string;
	displayName?: string;
	message: string;
	profileImageUrl?: string;
	mod?: boolean;
	vip?: boolean;
	highlighted?: boolean;
	subscriber?: boolean;
}

export const chatWebhook: RouteOptions = {
	method: "POST",
	url: "/chat",
	schema: {
		body: {
			type: "object",
			properties: ChatWebhookBodyType,
			required: ["username", "message"]
		},
		response: {
			200: {
				type: "boolean",
			},
		},
	},
	handler: async (request: FastifyRequest<{ Body: ChatWebhookBody }>, reply: FastifyReply) => {
		const body = request.body;
		const msgId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		
		const user = new StreamUser(
			body.username,
			body.profileImageUrl || "https://static-cdn.jtvnw.net/jtv_user_pictures/6763a6c9-741d-404b-8da1-1303bafbab5f-profile_image-70x70.png",
			body.displayName || body.username
		);

		const flags = {
			broadcaster: false,
			mod: body.mod || false,
			founder: false,
			subscriber: body.subscriber || false,
			vip: body.vip || false,
			highlighted: body.highlighted || false,
			customReward: false,
		};

		const extra = {
			id: msgId,
			channel: "test",
			roomId: "test",
			messageType: "chat" as const,
			isEmoteOnly: false,
			timestamp: new Date().toISOString(),
			userId: "test",
			username: body.username,
			displayName: body.displayName || body.username,
			userColor: "#00FFFF",
			userBadges: {},
			flags,
		};

		const onChatMessageEvent = new OnChatMessageEvent(
			user,
			body.message,
			body.message,
			flags,
			false,
			extra,
			extra.id
		);

		EventBus.eventEmitter.emit(BotEvents.OnChatMessage, onChatMessageEvent);
		reply.code(200).send(true);
	},
};
