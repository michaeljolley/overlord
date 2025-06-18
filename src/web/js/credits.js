const { computed, createApp, nextTick, onMounted, ref } = Vue

const typeDict = {
	'onChatMessage': 'Builders',
	'twitch:follow': 'New Followers',
	'twitch:sub': 'New Subscribers',
	'twitch:giftsub': 'Subs Gifted From',
	'twitch:raid': 'Awesome Raiders',
	'twitch:cheer': 'Cheered From',
	'twitch:donation': 'Donations From'
}

const credits = createApp({
	setup() {
		const credits = ref([]);

		const runCredits = function(payload) {
			credits.value = [];
			const newCredits = payload || [];
			
			newCredits.forEach(credit => {
				const { type, users } = credit;

				const labels = typeDict[type].split(' ') || [];
				const line1 = labels.length > 1 ? labels[0] : null;
				const line2 = labels.length > 1 ? labels[1] : null;
				const line3 = labels.length > 2 ? labels[2] : null;

				credits.value.push({
					line1,
					line2,
					line3,
					users: users.sort((a, b) => a > b)
				});
			});
			
			credits.value.push({
				line1: "Thanks",
				line2: "for Joining!",
				line3: null,
				message: "You are the secret sauce that makes this community great!",
				users: []
			});
		}

		onMounted(() => {
			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);
				if (event.type === "onCreditRoll") {
					credits.value = [];
					nextTick(() => {
						runCredits(event.payload);
					});
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
		});

		return { credits }
	},
	template:
	`<div class="credits" v-if="credits && credits.length > 0">
		<credit v-for="(credit, index) in credits" :key="index" :credit="credit" />
	</div>`
});

credits.component('credit', {
	template: `<div class="credit">
		<div v-if="credit">
			<div class="type">
				<transition name="fade">
					<div class="sign pink" v-if="credit.line1">
						<letter v-for="(letter, index) in credit.line1" :key="index" :letter="letter"/>
					</div>
				</transition>
				<transition name="fade">
					<div class="sign blue" v-if="credit.line2">
						<letter v-for="(letter, index) in credit.line2" :key="index" :letter="letter"/>
					</div>
				</transition>
				<transition name="fade">
					<div class="sign pink" v-if="credit.line3">
						<letter v-for="(letter, index) in credit.line3" :key="index" :letter="letter"/>
					</div>
				</transition>
			</div>
			<p v-if="credit.message" class="message" v-html="credit.message"></p>
			<div class="users-container" v-if="credit.users && credit.users.length > 0">
				<div class="users">
					<user v-for="(user, index) in credit.users" :key="user.id + index" :user="user"/>
				</div>
			</div>
		</div>
	</div>`,
	props: ['credit']
});

credits.component('letter', {
	setup() {
		const classes = ['', 'flicker', 'fast-flicker', 'fast-flicker2'];
		const assignedClass = ref(null);

		onMounted(() => {
			setTimeout(() => {
				const randomClass = Math.floor(Math.random() * 4);
				if (randomClass !== 0) {
					assignedClass.value = classes[randomClass];
				}
			}, 2500);
		})

		return { assignedClass };
	},
	template: '<span class="letter" v-bind:class="[assignedClass]">{{letter}}</span>',
  props: ['letter'],
});

credits.component('user', {
	setup(props) {
		const display_name = props.user.display_name || props.user.login;

		const bgImage = computed(
			() => `url(${props.user.avatar_url})`
		);
		
		return { display_name, bgImage };
	},
	template: `<div class="user">
		<div class="profile-pic" :style="{ backgroundImage: bgImage }"></div>
		<p>{{display_name}}</p>
	</div>`,
	props: ['user']
});

credits.mount('#app');
