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

const usersPerBatch = 9;
const millisecondsPerBatch = 4000;
const millisecondsPerBatchFade = 4000;

const credits = createApp({
	setup() {
		const credits = ref([]);
		const activeCredit = ref(null);

		const onInterval = function() {
			if (!activeCredit.value &&
        credits.value.length > 0) {
        processNextCredit();
      }
		}

		const processNextCredit = function() {
			if (credits.value.length > 0) {
				const nextCredit = credits.value.shift();
				const { type, users } = nextCredit;

				const labels = typeDict[type].split(' ') || [];
				const line1 = labels.length > 0 ? labels[0] : null;
				const line2 = labels.length > 1 ? labels[1] : null;
				const line3 = labels.length > 2 ? labels[2] : null;
				const lengthOfCredit = (Math.ceil(users.length / usersPerBatch) * (millisecondsPerBatch + millisecondsPerBatchFade)) + 500;

				activeCredit.value = {
					line1: line1 ? line1.split('') : null,
					line2: line2 ? line2.split('') : null,
					line3: line3 ? line3.split('') : null,
					users
				};
				
				setTimeout(() => {
					activeCredit.value = null;
				}, lengthOfCredit);
			}
		}


		const runCredits = function(payload) {
			credits.value = payload || [];
		}

		onMounted(() => {
			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);
				if (event.type === "onCreditRoll") {
					credits.value = [];
					nextTick(() => {
						runCredits(event.payload.credits);
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

			setInterval(onInterval, 2000);
		});

		return { activeCredit }
	},
	template: `
	<div class="credits" v-if="activeCredit">
		<credit :credit="activeCredit" />
	</div>`
});

credits.component('credit', {
	template: `
	<div class="credit" v-if="credit">
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
		<div class="users-container" v-if="credit.users && credit.users.length > 0">
			<users :users="credit.users" />
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

credits.component('users', {
	setup(props) {
		const batches = ref([]);
		const currentBatch = ref([]);

		const numberOfChunks = Math.ceil(props.users.length / usersPerBatch);

		batches.value = [...Array(numberOfChunks)]
			.map((_, index) => {
				return props.users.slice(index * usersPerBatch, (index + 1) * usersPerBatch)
			});

		const onInterval = function() {
			if (currentBatch.value.length === 0 &&
        batches.value.length > 0) {
        processNextBatch();
      }
		}

		const processNextBatch = function() {
			if (batches.value.length > 0) {
				currentBatch.value = batches.value.shift();
			}

			setTimeout(() => {
				currentBatch.value = [];
			}, millisecondsPerBatch);
		};

		onMounted(() => {
			setInterval(onInterval, 2000);
		});

		return { currentBatch };
	},
	template: `
	<div class="users">
			<user v-for="(user, index) in currentBatch" :key="user.id + index" :user="user"/>
	</div>`,
	props: ['users'],
});

credits.component('user', {
	setup(props) {
		const display_name = props.user.display_name || props.user.login;

		const bgImage = computed(
			() => `url(${props.user.avatar_url})`
		);
		
		return { display_name, bgImage };
	},
	template: `
	<transition name="userfade">
		<div class="user">
				<div class="profile-pic" :style="{ backgroundImage: bgImage }"></div>
				<p>{{display_name}}</p>
		</div>
	</transition>`,
	props: ['user']
});

credits.mount('#app');
