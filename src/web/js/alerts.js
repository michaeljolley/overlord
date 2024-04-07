const { createApp, onMounted, ref } = Vue

const alertTypes = [
	'twitch:follow',
	'twitch:sub',
	'twitch:raid',
	'twitch:cheer',
	'twitch:giftsub',
	'twitch:donation'
];

const alerts = createApp({
	setup() {
		const alerts = ref([]);
		const muted = ref(false);
		const audioPlayer = ref(null);
		const activeAlert = ref(null);
		
		const addAlert = function(type, payload) {
			if (alertTypes.includes(type)) {
				alerts.value.push({
					type,
					payload
				});
			} else if (type === "stream:audio") {
				audioMute(payload.muted);
			}
		}

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
			return `/assets/audio/${audioName}.mp3`;
		}
		
		const usernameText = function(username) {
			return `@${username}`
		}

		const clearAudio = function() {
			audioPlayer.value.src = '';
		}

		const stopAudio = function() {
			audioPlayer.value.pause();
		}
		
		const audioMute = function(isMuted) {
			muted.value = isMuted;
			if (isMuted) {
				stopAudio();
			}
		}
		
		const onInterval = function() {
			if (!activeAlert.value &&
        alerts.value.length > 0) {
        processNextAlert();
      }
		}

		const processNextAlert = function() {
			if (alerts.value.length > 0) {
				const nextAlert = alerts.value.shift();
				const { type, payload } = nextAlert;

				const name = usernameText(payload.username);
				let line1;
				let line2;
				let line3;
				let line4;
				let audio;

				switch (type) {
					case 'twitch:follow':
						line1 = 'New';
						line2 = 'Follower';
						audio = alertsAudioSrc('ohmy');
						break;
					case 'twitch:sub':
						line1 = 'Thanks';
						line2 = name;
						line3 = 'One of us!';
						audio = alertsAudioSrc('hair');
						break;
					case 'twitch:giftsub':
						line1 = `Showing love to`;
						line2 = name;
						line3 = `${payload.giftedTotal} friends!`;
						audio = alertsAudioSrc('hair');
						break;
					case 'twitch:raid': 
						line1 = 'Raid';
						line2 = name;
						line3 = 'Alert';
						audio = alertsAudioSrc('goodbadugly');
						break;
					case 'twitch:cheer':
						line1 = ' ';
						line2 = name;
						line3 = `cheered  ${payload.bits} bits!`;
						audio = alertsAudioSrc('cheer');
						break;
					case 'twitch:donation':
						line1 = `For the mods!`;
						line2 = payload.displayName || "Someone";
						line3 = `tipped 'em $${Math.round(payload.grossAmountInCents / 100, 2)}`;
						audio = alertsAudioSrc('donate');
						break;
				}

				activeAlert.value = {
					line1: line1 ? line1.split('') : null,
					line2: line2 ? line2.split('') : null,
					line3: line3 ? line3.split('') : null,
					line4: line4 ? line4.split('') : null,
					audio
				};

				playAudio();

				setTimeout(() => {
					activeAlert.value = null;
					audio = null;
				}, 15000);
			}
		}

		onMounted(() => {
			audioPlayer.value?.addEventListener('ended', clearAudio, false);

			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);
				addAlert(event.type, event.payload);
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

			setInterval(onInterval, 2000);
		});

		return { activeAlert, audioPlayer }
	},
	template:
	`<div class="alerts">
		<audio ref="audioPlayer"></audio>
		<div v-if="activeAlert">
			<transition name="fade">
				<div class="sign pink" v-if="activeAlert.line1">
					<letter v-for="(letter, index) in activeAlert.line1" :key="index" :letter="letter"/>
				</div>
			</transition>
			<transition name="fade">
				<div class="sign blue" v-if="activeAlert.line2">
					<letter v-for="(letter, index) in activeAlert.line2" :key="index" :letter="letter"/>
				</div>
			</transition>
			<transition name="fade">
				<div class="sign pink" v-if="activeAlert.line3">
					<letter v-for="(letter, index) in activeAlert.line3" :key="index" :letter="letter"/>
				</div>
			</transition>
			<transition name="fade">
				<div class="sign blue small" v-if="activeAlert.line4">
					<letter v-for="(letter, index) in activeAlert.line4" :key="index" :letter="letter"/>
				</div>
			</transition>
		</div>
	</div>`
});

alerts.component('letter', {
	setup() {
		const hideMe = ref(false);
		const classes = ['', 'flicker', 'fast-flicker', 'fast-flicker2'];
		const assignedClass = ref(null);

		const finish = function () {
      hideMe.value = true;
      assignedClass.value = null;
    }

		onMounted(() => {
			setTimeout(() => {
				const turnOff = Math.floor(Math.random() * 6) + 3;
	
				const randomClass = Math.floor(Math.random() * 4);
				if (randomClass !== 0) {
					assignedClass.value = classes[randomClass];
				}
	
				setTimeout(finish, turnOff * 1000);
			}, 2500);
		})

		return { hideMe, assignedClass };
	},
	template: '<span class="letter" v-bind:class="[assignedClass,{ off: hideMe}]">{{letter}}</span>',
  props: ['letter'],
});

alerts.mount('#app');
