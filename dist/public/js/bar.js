import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { createPinia } from 'https://unpkg.com/pinia@2.1.7/dist/pinia.esm-browser.js';


// import ActivityIconsComponent from './activityIconsComponent.js'; 
import ActivityMessageComponent from './activityMessageComponent.js';
import useBarStore from './barStore.js';

const pinia = createPinia();

const bar = createApp({
	components: {
		// 'activity-icons': ActivityIconsComponent,
		'activity-message': ActivityMessageComponent
	},
	setup() {
		const store = useBarStore();

		const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

		webSocket.value.onmessage = function(e) {
			const event = JSON.parse(e.data);
			store.insertMessage(event);
		}

		webSocket.value.onopen = function(e) {
			console.log('Connection opened');
		}

		webSocket.value.onerror = function(e) {
			console.log('Error: ', e);
		}

		webSocket.value.onclose = function(e) {
			console.log('Connection closed');
			window.location.reload();
		}

		return {  }
	}
});

bar.use(pinia);
bar.mount('#bar');
