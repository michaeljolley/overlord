import EventBus from "../eventBus";
const CheerWebhookBodyType = {
    username: { type: "string" },
    bits: { type: "number" },
    message: { type: "string" },
};
export const cheerWebhook = {
    method: "POST",
    url: "/cheer",
    schema: {
        body: {
            type: "object",
            properties: CheerWebhookBodyType
        },
        response: {
            200: {
                type: "boolean",
            },
        },
    },
    handler: (request, reply) => {
        EventBus.eventEmitter.emit("twitch:cheer", request.body);
        reply.code(200).send(true);
    },
};
