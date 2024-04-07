import EventBus from "../eventBus";
const StreamIconIncrementWebhookBodyType = {
    name: { type: "string" }
};
export const iconIncrementWebhook = {
    method: "POST",
    url: "/icon/increment",
    schema: {
        body: {
            type: "object",
            properties: StreamIconIncrementWebhookBodyType
        },
        response: {
            200: {
                type: "boolean",
            },
        },
    },
    handler: (request, reply) => {
        EventBus.eventEmitter.emit("stream:icon:increment", request.body);
        reply.code(200).send(true);
    },
};
