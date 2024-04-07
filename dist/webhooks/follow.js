import EventBus from "../eventBus";
const FollowWebhookBodyType = {
    username: { type: "string" },
    profileImageUrl: { type: "string" },
};
export const followWebhook = {
    method: "POST",
    url: "/follow",
    schema: {
        body: {
            type: "object",
            properties: FollowWebhookBodyType
        },
        response: {
            200: {
                type: "boolean",
            },
        },
    },
    handler: (request, reply) => {
        EventBus.eventEmitter.emit("twitch:follow", request.body);
        reply.code(200).send(true);
    },
};
