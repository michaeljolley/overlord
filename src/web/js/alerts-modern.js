const { createApp, onMounted, ref } = Vue;

const audioSrc = (name) => `/assets/audio/${name}.mp3`;

const alertConfigs = {
	'twitch:follow': (p) => ({
		theme: 'follow',
		label: 'Thanks for the follow',
		username: p.username,
		avatar: p.profileImageUrl,
		audio: audioSrc('ohmy'),
	}),
	'twitch:sub': (p) => ({
		theme: 'sub',
		label: 'Subscription Acquired',
		username: p.username,
		avatar: p.profileImageUrl,
		audio: audioSrc('hair'),
	}),
	'twitch:giftsub': (p) => ({
		theme: 'giftsub',
		label: `Gifted ${p.giftedTotal || 1} Sub${(p.giftedTotal || 1) > 1 ? 's' : ''}`,
		username: p.username,
		avatar: p.profileImageUrl,
		audio: audioSrc('hair'),
	}),
	'twitch:raid': (p) => ({
		theme: 'raid',
		label: `Incoming raid with ${p.viewers || '???'} friends`,
		username: p.username,
		avatar: p.profileImageUrl,
		audio: audioSrc('goodbadugly'),
	}),
	'twitch:cheer': (p) => ({
		theme: 'cheer',
		label: `Thanks for the ${p.bits || '???'} bits`,
		username: p.username,
		avatar: p.profileImageUrl,
		audio: audioSrc('cheer'),
	}),
	'twitch:donation': (p) => ({
		theme: 'donation',
		label: 'Donation',
		username: p.displayName || 'Someone',
		avatar: p.profileImageUrl,
		audio: audioSrc('donate'),
	}),
	'twitch:blazor': (p) => ({
		theme: 'blazor',
		label: 'Blazor!?',
		username: p.username || 'Someone',
		avatar: p.profileImageUrl,
		audio: audioSrc('metal-gear-alert'),
	}),
};

const app = createApp({
	setup() {
		const queue = ref([]);
		const activeAlert = ref(null);
		const audioPlayer = ref(null);
		const muted = ref(false);

		const addAlert = (type, payload) => {
			if (alertConfigs[type]) {
				queue.value.push({ type, payload });
			} else if (type === 'stream:audio') {
				muted.value = payload.muted;
				if (payload.muted && audioPlayer.value) audioPlayer.value.pause();
			}
		};

		const playAudio = () => {
			if (!activeAlert.value?.audio || !audioPlayer.value || muted.value) return;
			audioPlayer.value.src = activeAlert.value.audio;
			setTimeout(() => {
				audioPlayer.value.play().catch(console.error);
			}, 800);
		};

		const processNextAlert = () => {
			if (activeAlert.value || queue.value.length === 0) return;

			const { type, payload } = queue.value.shift();
			const config = alertConfigs[type]?.(payload);
			if (!config) return;

			activeAlert.value = config;
			playAudio();
			setTimeout(() => { activeAlert.value = null; }, 8000);
		};

		onMounted(() => {
			audioPlayer.value?.addEventListener('ended', () => {
				if (audioPlayer.value) audioPlayer.value.src = '';
			});

			const ws = new WebSocket(`ws://${window.location.host}/socket`);
			ws.onmessage = (e) => {
				const event = JSON.parse(e.data);
				addAlert(event.type, event.payload);
			};
			ws.onopen = () => console.log('Connection opened');
			ws.onerror = (e) => console.error('WebSocket error:', e);
			ws.onclose = () => {
				console.log('Connection closed');
				window.location.reload();
			};

			setInterval(processNextAlert, 2000);
		});

		return { activeAlert, audioPlayer };
	},
	template: `
		<div class="alerts-container">
			<audio ref="audioPlayer"></audio>
			<transition name="alert">
				<div v-if="activeAlert" class="alert-block" :class="'theme-' + activeAlert.theme">
					<div class="alert-type">{{ activeAlert.label }}</div>
					<div class="alert-line"></div>
					<div class="alert-content">
						<div v-if="activeAlert.avatar" class="alert-avatar" :style="{ backgroundImage: 'url(' + activeAlert.avatar + ')' }"></div>
						<div class="alert-username">
							{{ activeAlert.username }}
						</div>
					</div>
				</div>
			</transition>
		</div>
	`,
});

app.mount('#app');
