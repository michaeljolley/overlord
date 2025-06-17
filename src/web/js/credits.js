const { createApp, onMounted, ref } = Vue

const typeDict = {
	'onChatMessage': 'Builders',
	'twitch:follow': 'New Followers',
	'twitch:sub': 'New Subscribers',
	'twitch:giftsub': 'Subs Gifted By',
	'twitch:raid': 'Raids By',
	'twitch:cheer': 'Cheered By',
	'twitch:donation': 'Donations By'
}

const maxUsers = 9;
const millisecondsPerUserGroup = 10;

const credits = createApp({
	setup() {
		const credits = ref([]);
		const activeType = ref(null);

		const onInterval = function() {
			if (!activeType.value &&
        credits.value.length > 0) {
        processNextCredit();
      }
		}

		const processNextCredit = function() {
			if (credits.value.length > 0) {
				const nextCredit = credits.value.shift();
				const { type, users } = nextCredit;

				console.dir(nextCredit);

				const labels = typeDict[type].split(' ') || [];
				const line1 = labels.length > 1 ? labels[0] : null;
				const line2 = labels.length > 1 ? labels[1] : null;
				const line3 = labels.length > 2 ? labels[2] : null;

				const timeout = users.length < maxUsers ? millisecondsPerUserGroup : users.length / maxUsers * millisecondsPerUserGroup;

				activeType.value = {
					line1,
					line2,
					line3,
					users
				};

				setTimeout(() => {
					activeType.value = null;
				}, timeout);
			}
		}

		const runCredits = function(payload) {
			credits.value = payload.credits;
		}

		onMounted(() => {
			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);

				if (event.type === "onCreditRoll") {
					runCredits(event.payload);
				}
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

		return { activeType }
	},
	template:
	`<div class="credits">
		<div v-if="activeType">
			<div class="users">
				<div>
					<transition name="fade">
						<div class="sign" class="pink" v-if="activeAlert.line1">
							<letter v-for="(letter, index) in activeType.line1" :key="index" :letter="letter"/>
						</div>
					</transition>
					<transition name="fade">
						<div class="sign" class="blue" v-if="activeType.line2">
							<letter v-for="(letter, index) in activeType.line2" :key="index" :letter="letter"/>
						</div>
					</transition>
					<transition name="fade">
						<div class="sign" class="pink" v-if="activeType.line3">
							<letter v-for="(letter, index) in activeType.line3" :key="index" :letter="letter"/>
						</div>
					</transition>
				</div>
				<div class="users">
					<transition name="fade">
						<user v-for="(user, index) in activeType.users" :key="user + index" />
					</transition>
				</div>
		</div>
	</div>`
});

credits.component('letter', {
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

credits.component('user', {
	setup() {
			
	},
	template: `<div class="user">
		<img v-if="user.avatar_url" :src="user.avatar_url" />
		<p>{{user.diplay_name}}</p>
	</div>`,
	props: ['user']
});

		credits.mount('#app');
