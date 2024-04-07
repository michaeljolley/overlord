import EventBus from "../eventBus";
const GiftSubWebhookBodyType = {
    username: { type: "string" },
    giftedTotal: { type: "number" },
};
export const giftedSubWebhook = {
    method: "POST",
    url: "/giftsub",
    schema: {
        body: {
            type: "object",
            properties: GiftSubWebhookBodyType
        },
        response: {
            200: {
                type: "boolean",
            },
        },
    },
    handler: (request, reply) => {
        EventBus.eventEmitter.emit("twitch:giftsub", request.body);
        reply.code(200).send(true);
    },
};
