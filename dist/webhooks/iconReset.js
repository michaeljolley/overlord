import EventBus from "../eventBus";
export const iconResetWebhook = {
    method: "POST",
    url: "/icon/reset",
    schema: {
        response: {
            200: {
                type: "boolean",
            },
        },
    },
    handler: (request, reply) => {
        EventBus.eventEmitter.emit("stream:icon:reset");
        reply.code(200).send(true);
    },
};
