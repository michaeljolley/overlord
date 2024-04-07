import WebSocket from "ws";
import EventBus from "../../eventBus";
const PALLYGG_API_KEY = process.env.PALLYGG_API_KEY;
let ws;
export default function pallygg() {
    ws = initWebsocket();
}
const onDisconnect = () => {
    ws = initWebsocket();
};
const onConnect = () => {
    console.log("Connected to PallyGG Websocket");
};
const onTip = (data) => {
    EventBus.eventEmitter.emit("twitch:donation", data.payload);
};
const initWebsocket = () => {
    const ws = new WebSocket(`wss://events.pally.gg?auth=${PALLYGG_API_KEY}&channel=firehose`);
    ws.on('connect', onConnect);
    ws.on('disconnect', onDisconnect);
    ws.on('campaigntip.notify', onTip);
    return ws;
};
