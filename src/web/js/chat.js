const { computed, createApp, onMounted, onUnmounted, ref } = Vue;

const isParty = ref(false);

const chat = createApp({
	setup() {
		const messages = ref([]);
		const chatMessage = ref(null);
		const shouldClear = ref(false);

		const addMessage = (onChatMessageEvent) => {
			messages.value = [onChatMessageEvent, ...messages.value];
		};
		const clearMessages = () => {
			shouldClear.value = true;
			const clearMSGTimeout = setTimeout(() => {
				messages.value = [];
				shouldClear.value = false;
				clearTimeout(clearMSGTimeout);
			}, 1200);
		};
		const removeMessages = (count) => {
			messages.value = messages.value.slice(count);
		};
		const removeItem = (id) => {
			messages.value = messages.value.filter((f) => f.id !== id);
		};
		const checkOverflow = (_, done) => {
			const chatMessages = chatMessage.value;
			if (chatMessages) {
				const badGuys = chatMessages.filter((f) => {
					return f.$el.getBoundingClientRect().top < 0;
				}).length;
				removeMessages(badGuys);
			}
			done();
		};

		onMounted(() => {
			const webSocket = ref(
				new WebSocket(`ws://${window.location.host}/socket`)
			);

			webSocket.value.onmessage = function (e) {
				const event = JSON.parse(e.data);
				if (event.type === 'onChatMessage') {
					addMessage(event.payload);
				} else if (event.type === 'onChatClear') {
					clearMessages();
				} else if (event.type === 'onParty') {
					isParty.value = true;
					setTimeout(() => {
						isParty.value = false;
					}, 45000);
				}
			};

			webSocket.value.onopen = function (e) {
				console.log('Connection opened');
			};

			webSocket.value.onerror = function (e) {
				console.log('Error: ', e);
			};

			webSocket.value.onclose = function (e) {
				console.log('Connection closed');
				window.location.reload();
			};
		});

		return { messages, chatMessage, checkOverflow, removeItem, shouldClear };
	},
	computed: {
		hasHighlight() {
			return this.messages.some((m) => m.flags.highlighted);
		},
	},
	template: `<div class="chat" :class="{ fade: hasHighlight }">
	<transition-group name="list" @enter="checkOverflow">
		<chatMessage ref="chatMessage" v-for="(message, index) in messages" :key="message.id" :onChatMessageEvent="message" :ind="index" :total="messages.length" :getOuttaHere="shouldClear" v-on:removeItem="removeItem"></chatMessage>
	</transition-group>
</div>`,
});

chat.component('chatMessage', {
	emits: ['removeItem'],
	setup({ onChatMessageEvent }, { emit }) {
		const destroyTimeout = ref(null);
		const hideMe = ref(false);

		onMounted(() => {
			destroyTimeout.value = setTimeout(() => {
				hideMe.value = true;
				setTimeout(() => {
					emit('removeItem', onChatMessageEvent.id);
				}, 1100);
			}, 60000);
		});

		onUnmounted(() => {
			clearTimeout(destroyTimeout.value);
		});

		const bgImage = computed(
			() => `url(${onChatMessageEvent.user.avatar_url})`
		);

		return { hideMe, bgImage };
	},
	computed: {
		shake() {
			if (!isParty.value) {
				return null;
			}
			if (this.total % 3 === 0) {
				return 'shake3';
			}
			if (this.total % 2 === 0) {
				return 'shake2';
			}
			return 'shake';
		},
	},
	template: `
	<div class="message" :class="{ shake, hide: getOuttaHere || hideMe, highlighted: onChatMessageEvent.flags.highlighted, mod: onChatMessageEvent.flags.mod, vip: onChatMessageEvent.flags.vip, gift: onChatMessageEvent.isRegistered }" >
		<div class="wrap">
			<div class="panel">
				<div class="bubble">
					<div v-html="onChatMessageEvent.sanitizedMessage"></div>
					<div class="name">
						<div>	
							<div class="user" :style="{ backgroundImage: bgImage }"></div>
							{{onChatMessageEvent.user.display_name}}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>`,
	props: ['ind', 'onChatMessageEvent', 'total', 'getOuttaHere'],
});

chat.mount('#app');
