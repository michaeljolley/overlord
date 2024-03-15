const defaultMode = {
	mode: "Focus Time",
	activity: "Coding, Writing, or Designing"
};

const ignoredEvents = [
	"stream:icon:reset",
	"stream:icon:increment"
]

const alerts = createApp({
		setup() {
			const activeAlert = ref(null)

			const commode = ref(defaultMode);
			const alerts = ref([]);
			const muted = ref(false);
			const audioPlayer = ref(null);
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

			const addAlert = function (type, payload) {
				if (ignoredEvents.includes(type)) {
					return;
				} else if (type === "stream:mode") {
					commode.value = null;
					setTimeout(() => {
						commode.value = {...defaultMode, ...payload};
					}, 500);
					
					return;
				}
				alerts.value.push({
					type,
					payload
				});
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
				if (alerts.value.length > 0) {
					const nextAlert = alerts.value.shift();

					const { type, payload } = nextAlert;

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

					activeAlert.value = {
						message,
						subtext,
						audio: muted.value ? null : audio
					}

					playAudio();

					setTimeout(() => {
						activeAlert.value = null;
					}, 5000);
				}
			}
			
			const onInterval = function() {
				if (!activeAlert.value &&
					alerts.value.length > 0) {
					processNextAlert();
				}
			}

			setInterval(onInterval, 2000);

			onMounted(() => {
				audioPlayer.value?.addEventListener('ended', clearAudio, false);
			});

			return { activeAlert, commode, audioPlayer }
		}
	});
	
	alerts.component(
		'alert',
		{
			template: `<div class="alert" v-if="alert.message">
			<h1 v-html="alert.message"></h1>
			<p v-if="alert.subtext">{{alert.subtext}}</p>
		</div>`, 
			props: ['alert'],
		}
	)
	
	alerts.mount('#alerts')

