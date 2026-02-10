const { createApp, onMounted, onUnmounted, ref } = Vue;

const announcementDuration = 30000;

const app = createApp({
	setup() {
		const announcement = ref(null);
		const destroyTimeout = ref(null);

		const showAnnouncement = (payload) => {
			if (destroyTimeout.value) {
				clearTimeout(destroyTimeout.value);
			}

			announcement.value = payload;

			destroyTimeout.value = setTimeout(() => {
				announcement.value = null;
				destroyTimeout.value = null;
			}, announcementDuration);
		};

		onMounted(() => {
			const ws = new WebSocket(`ws://${window.location.host}/socket`);
			ws.onmessage = (e) => {
				const event = JSON.parse(e.data);
				if (event.type === 'onAnnouncement') {
					showAnnouncement(event.payload);
				}
			};
			ws.onopen = () => console.log('Connection opened');
			ws.onerror = (e) => console.error('WebSocket error:', e);
			ws.onclose = () => {
				console.log('Connection closed');
				window.location.reload();
			};
		});

		onUnmounted(() => {
			if (destroyTimeout.value) {
				clearTimeout(destroyTimeout.value);
			}
		});

		return { announcement };
	},
	template: `
		<div class="announce-container">
			<transition name="announce">
				<div v-if="announcement" class="announce-block">
					<div class="announce-line"></div>
					<div class="announce-title">{{ announcement.title }}</div>
					<div class="announce-subtitle" v-html="announcement.subtitle"></div>
				</div>
			</transition>
		</div>
	`,
});

app.mount('#app');
