import EventBus from "../eventBus";
export function registerWebsocket(fastify, _, done) {
    fastify.get("/socket", { websocket: true }, (connection, request) => {
        EventBus.eventEmitter.on("twitch:follow", (payload) => {
            connection.socket.send(JSON.stringify({ type: "twitch:follow", payload }));
        });
        EventBus.eventEmitter.on("twitch:raid", (payload) => {
            connection.socket.send(JSON.stringify({ type: "twitch:raid", payload }));
        });
        EventBus.eventEmitter.on("twitch:sub", (payload) => {
            connection.socket.send(JSON.stringify({ type: "twitch:sub", payload }));
        });
        EventBus.eventEmitter.on("twitch:giftsub", (payload) => {
            connection.socket.send(JSON.stringify({ type: "twitch:giftsub", payload }));
        });
        EventBus.eventEmitter.on("twitch:cheer", (payload) => {
            connection.socket.send(JSON.stringify({ type: "twitch:cheer", payload }));
        });
        EventBus.eventEmitter.on("twitch:donation", (payload) => {
            connection.socket.send(JSON.stringify({ type: "twitch:donation", payload }));
        });
        EventBus.eventEmitter.on("stream:mode", (payload) => {
            connection.socket.send(JSON.stringify({ type: "stream:mode", payload }));
        });
        EventBus.eventEmitter.on("stream:icon:increment", (payload) => {
            connection.socket.send(JSON.stringify({ type: "stream:icon:increment", payload }));
        });
        EventBus.eventEmitter.on("stream:icon:reset", (payload) => {
            connection.socket.send(JSON.stringify({ type: "stream:icon:reset", payload }));
        });
    });
    done();
}
