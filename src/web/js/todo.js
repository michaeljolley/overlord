const { computed, createApp, onMounted, onUnmounted, ref } = Vue

const chat = createApp({
	setup() {
		const todos = ref([]);


		onMounted(() => {
			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);
				if (event.type === 'onTodoUpdated') {
					todos.value = event.payload.todos;
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

		return { todos }
	},
	computed: {
		// hasHighlight() {
		// 	return this.messages.some(m => m.flags.highlighted);
		// }
	},
	template:
	`<div class="todos">
    <header>
      !todo {task} or !todo done
    </header>
    <main>
			<todo ref="todo" v-for="(todo, index) in todos" :key="todo.id" :todo="todo"></todo>
		</main>
	</div>`
});

chat.component('todo', {
	setup({ todo }) {
		const bgImage = computed(() => `url(${todo.user.avatar_url})`);
		return { bgImage };
	},
	template: `
		<div class="todo">
			<div class="name">
				<div class="user" :style="{ backgroundImage: bgImage }"></div>
				{{todo.user.display_name}}:
			</div>
			<div class="title" v-html="onChatMessageEvent.title"></div>
		</div>`,
  props: ['todo'],
});

chat.mount('#app');

