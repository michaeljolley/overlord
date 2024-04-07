import EventBus from "../eventBus";
const ModeWebhookBodyType = {
    "mode": { type: "string" },
    "activity": { type: "string" },
};
export const modeWebhook = {
    method: "POST",
    url: "/mode",
    schema: {
        body: {
            type: "object",
            properties: ModeWebhookBodyType
        },
        response: {
            200: {
                type: "boolean",
            },
        },
    },
    handler: (request, reply) => {
        EventBus.eventEmitter.emit("stream:mode", request.body);
        reply.code(200).send(true);
    },
};
