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
			}, 800);
		};

		const removeMessages = (messagesToPop) => {
			messages.value = messages.value.slice(0, messages.value.length - messagesToPop + 1);
		};

		const removeItem = (id) => {
			messages.value = messages.value.filter((f) => f.id !== id);
		};

		const checkOverflow = (_, done) => {
			const chatMessages = chatMessage.value;
			if (chatMessages) {
				const messagesToPop = chatMessages.filter((f) => {
					return f.$el.getBoundingClientRect().top < 60;
				}).length;
				if (messagesToPop > 0) {
					removeMessages(messagesToPop);
				}
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
					}, 50000);
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
	template: `<div class="chat-container">
	<transition-group name="msg" @enter="checkOverflow">
		<chatMessage 
			ref="chatMessage" 
			v-for="(message, index) in messages" 
			:key="message.id" 
			:onChatMessageEvent="message" 
			:ind="index" 
			:total="messages.length" 
			:getOuttaHere="shouldClear" 
			v-on:removeItem="removeItem"
		></chatMessage>
	</transition-group>
</div>`,
});

chat.component('chatMessage', {
	emits: ['removeItem'],
	setup({ onChatMessageEvent }, { emit }) {
		const destroyTimeout = ref(null);
		const hideMe = ref(false);
		const isNew = ref(true);

		onMounted(() => {
			// Remove "new" state after entrance animation
			setTimeout(() => {
				isNew.value = false;
			}, 600);

			destroyTimeout.value = setTimeout(() => {
				hideMe.value = true;
				setTimeout(() => {
					emit('removeItem', onChatMessageEvent.id);
				}, 600);
			}, 45000);
		});

		onUnmounted(() => {
			clearTimeout(destroyTimeout.value);
		});

		const bgImage = computed(
			() => `url(${onChatMessageEvent.user.avatar_url})`
		);

		const userRole = computed(() => {
			if (onChatMessageEvent.flags.highlighted) return 'highlighted';
			if (onChatMessageEvent.flags.mod) return 'mod';
			if (onChatMessageEvent.flags.vip) return 'vip';
			return 'viewer';
		});

		const isSub = computed(() => 
			onChatMessageEvent.flags.subscriber && userRole.value === 'viewer'
		);

		return { hideMe, bgImage, userRole, isNew, isSub };
	},
	computed: {
		bounce() {
			if (!isParty.value) return null;
			const variants = ['bounce-1', 'bounce-2', 'bounce-3'];
			return variants[this.ind % 3];
		},
	},
	template: `
	<div class="message" :class="[userRole, bounce, { hide: getOuttaHere || hideMe, 'is-new': isNew, 'sub-sheen': isSub }]">
		<div class="message-inner">
			<div class="avatar-ring">
				<div class="avatar" :style="{ backgroundImage: bgImage }"></div>
			</div>
			<div class="content">
				<div class="meta">
					<span class="username">{{ onChatMessageEvent.user.display_name }}</span>
					<span class="role-badge" v-if="onChatMessageEvent.flags.mod">MOD</span>
					<span class="role-badge vip-badge" v-if="onChatMessageEvent.flags.vip">VIP</span>
					<span class="role-badge sub-badge" v-if="onChatMessageEvent.flags.subscriber">SUB</span>
				</div>
				<div class="text" v-html="onChatMessageEvent.sanitizedMessage"></div>
			</div>
		</div>
		<div class="glow"></div>
	</div>`,
	props: ['ind', 'onChatMessageEvent', 'total', 'getOuttaHere'],
});

chat.mount('#app');
