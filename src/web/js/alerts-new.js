const { createApp, onMounted, ref } = Vue;

const audioSrc = (name) => `/assets/audio/${name}.mp3`;

/**
 * Alert type configs — each returns lines (text + color) and audio.
 * Replaces the original switch statement for easier maintenance.
 */
const alertConfigs = {
	'twitch:follow': (p) => ({
		lines: [
			{ text: 'New', color: 'pink' },
			{ text: 'Follower', color: 'blue' },
		],
		audio: audioSrc('ohmy'),
	}),
	'twitch:sub': (p) => ({
		lines: [
			{ text: 'Thanks', color: 'pink' },
			{ text: p.username, color: 'blue' },
			{ text: 'One of us!', color: 'pink' },
		],
		audio: audioSrc('hair'),
	}),
	'twitch:giftsub': (p) => ({
		lines: [
			{ text: 'Showing love to', color: 'pink' },
			{ text: p.username, color: 'blue' },
			{
				text: `${p.giftedTotal === 1 ? 'a' : p.giftedTotal} friend${p.giftedTotal > 1 ? 's' : ''}!`,
				color: 'pink',
			},
		],
		audio: audioSrc('hair'),
	}),
	'twitch:raid': (p) => ({
		lines: [
			{ text: 'Raid', color: 'pink' },
			{ text: p.username, color: 'blue' },
			{ text: 'Alert', color: 'pink' },
		],
		audio: audioSrc('goodbadugly'),
	}),
	'twitch:cheer': (p) => ({
		lines: [
			{ text: ' ', color: 'pink' },
			{ text: p.username, color: 'blue' },
			{ text: `cheered  ${p.bits || '???'} bits!`, color: 'pink' },
		],
		audio: audioSrc('cheer'),
	}),
	'twitch:donation': (p) => ({
		lines: [
			{ text: 'For the mods!', color: 'pink' },
			{ text: p.displayName || 'Someone', color: 'blue' },
			{ text: `tipped 'em $${Math.round(p.grossAmountInCents / 100)}`, color: 'pink' },
		],
		audio: audioSrc('donate'),
	}),
	'twitch:blazor': (p) => ({
		lines: [
			{ text: 'Blazor!?', color: 'pink' },
			{ text: p.username || 'Someone', color: 'blue' },
			{ text: 'I hardly knew her', color: 'pink' },
		],
		audio: audioSrc('metal-gear-alert'),
	}),
};

const app = createApp({
	setup() {
		const queue = ref([]);
		const activeAlert = ref(null);
		const audioPlayer = ref(null);
		const muted = ref(false);
		const glowLevels = ref([]);
		const lineLitCounts = ref([]);

		const onLetterDied = (lineIndex) => {
			lineLitCounts.value[lineIndex] = Math.max(0, lineLitCounts.value[lineIndex] - 1);
			const total = activeAlert.value?.lines[lineIndex]?.letters.length || 1;
			glowLevels.value[lineIndex] = +(lineLitCounts.value[lineIndex] / total * 0.18).toFixed(3);
		};

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
			}, 1500);
		};

		const processNextAlert = () => {
			if (activeAlert.value || queue.value.length === 0) return;

			const { type, payload } = queue.value.shift();
			const config = alertConfigs[type]?.(payload);
			if (!config) return;

			activeAlert.value = {
				lines: config.lines.map((line) => ({
					...line,
					letters: line.text.split(''),
				})),
				audio: config.audio,
			};

			lineLitCounts.value = activeAlert.value.lines.map(l => l.letters.length);
			glowLevels.value = activeAlert.value.lines.map(() => 0.18);

			playAudio();
			setTimeout(() => { activeAlert.value = null; }, 10000);
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

		return { activeAlert, audioPlayer, glowLevels, onLetterDied };
	},
	template: `
		<div class="alerts-new">
			<audio ref="audioPlayer"></audio>
			<transition name="alert">
				<div v-if="activeAlert" class="alert-container">
					<div
						v-for="(line, li) in activeAlert.lines"
						:key="li"
						class="sign"
						:class="line.color"
						:style="{ '--glow-opacity': glowLevels[li] }"
					>
						<neon-letter
							v-for="(ch, ci) in line.letters"
							:key="ci"
							:char="ch"
							:index="ci"
							@died="onLetterDied(li)"
						/>
					</div>
				</div>
			</transition>
		</div>
	`,
});

/**
 * <neon-letter> — each character is an independent neon tube.
 *
 * Improvements over the original:
 *   1. Staggered cascade turn-on (left → right warm-up via --cascade-delay)
 *   2. Per-letter unique blink rate (random --blink-dur instead of 3 fixed classes)
 *   3. "Dying" sputter animation before going dark (rapid on/off flickers)
 */
app.component('neon-letter', {
	props: ['char', 'index'],
	emits: ['died'],
	setup(props, { emit }) {
		const isDying = ref(false);
		const isOff = ref(false);

		// Every letter gets its own randomised timing
		const cascadeDelay = (props.index * 0.07 + Math.random() * 0.05).toFixed(3);
		const shineDur     = (1.0 + Math.random() * 1.0).toFixed(2);
		const blinkDur     = (2 + Math.random() * 8).toFixed(2);
		const blinkDelay   = (parseFloat(cascadeDelay) + parseFloat(shineDur) + 0.2 + Math.random() * 0.5).toFixed(2);
		const dyingDur     = (0.4 + Math.random() * 0.6).toFixed(2);

		const style = {
			'--cascade-delay': cascadeDelay + 's',
			'--shine-dur':     shineDur + 's',
			'--blink-dur':     blinkDur + 's',
			'--blink-delay':   blinkDelay + 's',
			'--dying-dur':     dyingDur + 's',
		};

		onMounted(() => {
			const turnOffAt = 3500 + Math.random() * 5500;

			setTimeout(() => {
				isDying.value = true;
				setTimeout(() => {
					isDying.value = false;
					isOff.value = true;
					emit('died');
				}, parseFloat(dyingDur) * 1000);
			}, turnOffAt);
		});

		return { isDying, isOff, style };
	},
	template: '<span class="letter" :class="{ dying: isDying, off: isOff }" :style="style">{{ char }}</span>',
});

app.mount('#app');
