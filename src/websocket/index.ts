import { FastifyInstance, FastifyRequest } from "fastify";
import EventBus from "../eventBus";
import { SocketStream } from "@fastify/websocket";
import { BotEvents } from "../botEvents";
import { OnChatMessageEvent } from "../types/onChatMessageEvent";
import { FollowWebhookBody } from "../webhooks/follow";
import { RaidWebhookBody } from "../webhooks/raid";
import { SubWebhookBody } from "../webhooks/sub";
import { GiftSubWebhookBody } from "../webhooks/giftsub";
import { CheerWebhookBody } from "../webhooks/cheer";
import { TipWebhookBody } from "../webhooks/tip";
import { CreditsWebhookBody } from "../webhooks/credits";
import { CreditRoll } from "../types/creditRoll";

export function registerWebsocket(fastify: FastifyInstance, _: any, done: () => void) {

	fastify.get("/socket", { websocket: true }, (connection: SocketStream, request: FastifyRequest) => {
		
		EventBus.eventEmitter.on(BotEvents.OnChatMessage, async (payload: OnChatMessageEvent) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnChatMessage, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnFollow, async (payload: FollowWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnFollow, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnRaid, async (payload: RaidWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnRaid, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnSub, async (payload: SubWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnSub, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnGiftSub, async (payload: GiftSubWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnGiftSub, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnCheer, async (payload: CheerWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCheer, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnDonation, async (payload: TipWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnDonation, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnStreamMode, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnStreamMode, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnAudioControl, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnAudioControl, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnSoundEffect, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnSoundEffect, payload }));
		});

		EventBus.eventEmitter.on(BotEvents.OnTriggerCredits, async (payload: CreditsWebhookBody) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnTriggerCredits, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnCreditRoll, async (payload: { credits: CreditRoll[] }) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnCreditRoll, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.Announcement, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.Announcement, payload }));
		});
		
		EventBus.eventEmitter.on(BotEvents.OnParty, (payload: any) => {
			connection.socket.send(JSON.stringify({ type: BotEvents.OnParty, payload }));
		});
	});

	done();
}
