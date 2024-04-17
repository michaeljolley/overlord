import WebSocket from "ws";
import EventBus from "../../eventBus";

const PALLYGG_API_KEY = process.env.PALLYGG_API_KEY;

let ws: WebSocket;
let pingInterval: NodeJS.Timeout;

export default function pallygg() {
	ws = initWebsocket();
}

const onDisconnect = () => {
	ws = initWebsocket();
}

const onConnect = (): void => {
	console.log("Connected to PallyGG Websocket");
}

const onError = (err: any): void => {
	console.log(`Error: ${err}`);
}

const onMessage = (data: any): void => {
	const pallyData = JSON.parse(Buffer.from(data).toString());
	if (pallyData.type === "campaigntip.notify") {
		console.log("PallyGG Donation: ", pallyData.payload.campaignTip);
		EventBus.eventEmitter.emit("twitch:donation", pallyData.payload.campaignTip);
	}
}

const initWebsocket = (): WebSocket => {
	const ws = new WebSocket(`wss://events.pally.gg?auth=${PALLYGG_API_KEY}&channel=firehose`);
	ws.binaryType = "arraybuffer";

	ws.on('message', onMessage);
	ws.on('close', onDisconnect);
	ws.on('open', onConnect);
	ws.on('error', onError);

	if (pingInterval) {
		clearInterval(pingInterval);
	}
	pingInterval = setInterval(() => {
		ws.ping();
	}, 50000);

	return ws;
}

