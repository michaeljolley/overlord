import { onMounted, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { storeToRefs } from  'https://unpkg.com/pinia@2.1.7/dist/pinia.esm-browser.js';

import AlertComponent from './alertComponent.js';
import useBarStore from './barStore.js';

export default {
	components: {
		'alert': AlertComponent
	},
	setup() {
		const store = useBarStore();
		const { activeAlert, currentMode } = storeToRefs(store);

		const muted = ref(false);
		const audioPlayer = ref(null);
		const nextAlert = ref(null);

		const playAudio = function() {
			if (activeAlert.value?.audio) {
				audioPlayer.value.src = activeAlert.value.audio;
				setTimeout(() => {
					audioPlayer.value.play().catch(error => {
						console.log(error);
					});
				}, 1500);
			}
		}

		const alertsAudioSrc = function(audioName) {
			return `audio/${audioName}.mp3`;
		}

		const usernameText = function(username) {
			return `<span>@${username}</span>`
		}

		const stopAudio = function() {
			audioPlayer.value.pause();
		}

		const muteAudio = function() {
			audioPlayer.value.pause();
			muted.value = true;
		}

		const clearAudio = function() {
			audioPlayer.value.src = '';
		}
		
		const unmuteAudio = function() {
			muted.value = false;
		}

		const processNextAlert = function() {
			if (store.activityMessages.length > 0) {
				store.nextActivityMessage();

				const { type, payload } = activeAlert.value;

				let message;
				let subtext;
				let audio;

				switch (type) {
					case 'twitch:follow':
						message = `Welcome ${usernameText(payload.username)}!`;
						subtext = "Thanks for the follow.";
						audio = alertsAudioSrc('ohmy');
						break;
					case 'twitch:sub':
						message = `Holy frijole! ${usernameText(payload.username)} just subscribed.`;
						subtext = payload.message || "I gotta have this content!";
						audio = alertsAudioSrc('hair');
						break;
					case 'twitch:giftsub':
						message = `${usernameText(payload.username)} the Blessed hath arrived.`;
						subtext = `They hast bestowed ${payload.giftedTotal} peasants with a sub.`;
						audio = alertsAudioSrc('hair');
						break;
					case 'twitch:raid': 
						message = `Welcome ${usernameText(payload.username)} and friends!`;
						subtext = `${payload.viewers} just joined in the fun.`;
						audio = alertsAudioSrc('goodbadugly');
						break;
					case 'twitch:cheer':
						message = `${usernameText(payload.username)} droppin' ${payload.bits} dimes`;
						subtext = payload.message || "All ur bits are belong to us.";
						audio = alertsAudioSrc('cheer');
						break;
				}

				nextAlert.value = {
					message,
					subtext,
					audio: muted.value ? null : audio
				}

				playAudio();

				setTimeout(() => {
					nextAlert.value = null;
				}, 5000);
			}
		}
		
		const onInterval = function() {
			if (!nextAlert.value &&
				store.activityMessages.length > 0) {
				processNextAlert();
			}
		}

		setInterval(onInterval, 2000);

		onMounted(() => {
			audioPlayer.value?.addEventListener('ended', clearAudio, false);
		});

		return { nextAlert, audioPlayer, currentMode }
	},
	template: `<div id="alerts">
	<audio ref="audioPlayer"></audio>
	<Transition mode="out-in">
		<div class="mode" v-if="!nextAlert && currentMode">
			<h1 v-html="currentMode.mode"></h1>
			<p v-html="currentMode.activity"></p>
		</div>
	</Transition>
	<Transition mode="out-in">
		<alert :alert="nextAlert" v-if="nextAlert"/>
	</Transition>
</div>`
};
