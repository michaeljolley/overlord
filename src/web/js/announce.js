const { computed, createApp, onMounted, onUnmounted, ref } = Vue

const announce = createApp({
	setup() {
		const chatMessage = ref(null);
		const announcePolygon = ref(null);
		const announceClipPolygon = ref(null);
		
		let firstV = 0;
		let lastH = 0;
		
		const generateRandomPointArr = () => {
				let list = [];
				let pathList = [];
				lastH = 0;
		
				while (lastH !== 960) {
						const h = lastH;
						let v = getRandomInt(10, 130);
						if (h === 960) {
								v = 300;
						}
						if (lastH === 0) {
								firstV = v;
								list.push(`${h - 40}, ${v}`);
								list.push(`${h}, ${v}`);
								pathList.push(`M ${h} ${v}`);
						} else {
								list.push(`${h}, ${v}`);
								pathList.push(`L ${h} ${v}`);
						}
						setNewLastH();
				}
				
				list.push(`960, 300`);
				list.push('980, 350');
				list.push('-50, 350');
				pathList.push(`L 960 300`);
				
				return {list, pathList};
		}
		
		const setNewLastH = () => {
				lastH = getRandomInt(lastH + 40, lastH + 150);
				if (lastH >= 900) {
						lastH = 960;
				}
		}
		
		const generateSVGPointListFromArray = () => {
				let _arr = generateRandomPointArr();
				return {
						poly: _arr.list.join(' '),
						path: _arr.pathList.join(' ')
				};
		}
		
		const setNewSVGList = () => {
			let {poly: list} = generateSVGPointListFromArray();

			announcePolygon.value.setAttribute('points', list);
			announceClipPolygon.value.setAttribute('points', list);
		}
		
		const getRandomInt = (min, max) => {
				return Math.floor(Math.random() * (max - min + 1) + min);
		}

		const newMessage = (payload) => {
			chatMessage.value = undefined;
			setNewSVGList();
			chatMessage.value = payload;
		}
	
		onMounted(() => {
			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);
				if (event.type === 'onChatMessage') {
					setTimeout(newMessage(event.payload), 1000);
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

		return { announcePolygon, announceClipPolygon, chatMessage }
	},
	template:
	`
	<div id="window">
		<div class="content" v-if="chatMessage">
			<h1>{{chatMessage.user.display_name}}</h1>
			<p>{{chatMessage.sanitizedMessage}}</p>
		</div>

		
		<svg xmlns="http://www.w3.org/2000/svg">
			<g>
				<polygon ref="announcePolygon" class="bgPolygon"/>
			</g>
			
			<mask id="clip" class="clip">
				<polygon ref="announceClipPolygon"/>
			</mask>
			
			<foreignObject mask="url(#clip)"
										x="-500" y="-500" 
										width="2000" height="2000">
				<div
				style="width: 100%; height: 100%; border-radius: 50%;background: linear-gradient(to right, var(--neonpink) 10%, var(--neonblue) 100%);"
				xmlns="http://www.w3.org/1999/xhtml"
						</div>
			</foreignObject>
		</svg>

	</div>
`
});

announce.mount('#app');
