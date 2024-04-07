import EventBus from "../eventBus";
const RaidWebhookBodyType = {
    username: { type: "string" },
    viewers: { type: "number" },
};
export const raidWebhook = {
    method: "POST",
    url: "/raid",
    schema: {
        body: {
            type: "object",
            properties: RaidWebhookBodyType
        },
        response: {
            200: {
                type: "boolean",
            },
        },
    },
    handler: (request, reply) => {
        EventBus.eventEmitter.emit("twitch:raid", request.body);
        reply.code(200).send(true);
    },
};
