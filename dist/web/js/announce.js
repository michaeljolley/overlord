const { computed, createApp, onMounted, onUnmounted, ref, watch } = Vue

const _announcementLength = 30000;

const announce = createApp({
	setup() {
		const destroyTimeout = ref(null);
		const announcement = ref(null);
		
		const newAnnouncement = (payload) => {
      destroyTimeout.value = setTimeout(() => {
				announcement.value = undefined;
			}, _announcementLength);

      announcement.value = payload;
		}
	
		onMounted(() => {
			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);
				if (event.type === 'onAnnouncement') {
					setTimeout(newAnnouncement(event.payload), 1000);
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

    onUnmounted(() => {
      if (destroyTimeout.value) {
        clearTimeout(destroyTimeout.value);
      }
    });

		return { announcement }
	},
	template:
	`
	<div id="window">
			<div class="announcement">
				<Transition name="bottom-content">
					<div class="content" v-if="announcement">
						<h1>{{announcement.title}}</h1>
						<p v-html="announcement.subtitle"></p>
					</div>
				</Transition>
				<polyBG :announcement="announcement"/>
			</div>
	</div>
`
});

announce.component('polyBG', {
	template: `
  <svg xmlns="http://www.w3.org/2000/svg">
    <g>
			<Transition name="bottom-poly">
      	<polygon ref="announcePolygon" class="bgPolygon" v-if="announcement"/>
			</Transition>
    </g>
    
    <mask id="clip" class="clip">
			<Transition name="bottom-path">
				<path ref="announceClipPath" v-if="announcement"/>
			</Transition>
    </mask>

		<foreignObject mask="url(#clip)"
                  x="-500" y="-500" 
                  width="2000" height="2000"
									style="mask:url(#clip);-webkit-mask:url(#clip);">
      <div
      	style="width: 100%; height: 100%; border-radius: 50%;background: conic-gradient(from 270deg, var(--neonpink) 1%, var(--neonblue) 49%, var(--neonblue) 51%, var(--neonpink) 99%);/*animation: colorRotate 7.5s 0.5s infinite linear;*/"
      >
          </div>
    </foreignObject>
  </svg>
  `,
	props: ['announcement'],
	data() {
		return {
			firstV: 0,
			lastH: 0
		};
	},
  watch: {
    announcement(newAnnouncement, oldAnnouncement) {
      if (newAnnouncement) {
				this.setNewSVGList();
			}
    }
  },
	methods: {
		generateRandomPointArr() {
			let list = [];
			let pathList = [];
			lastH = 0;
	
			while (lastH !== 960) {
					const h = lastH;
					let v = this.getRandomInt(10, 110);
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
					this.setNewLastH();
			}
			
			list.push(`960, 300`);
			list.push('980, 350');
			list.push('-50, 350');
			pathList.push(`L 960 300`);
			
			return {list, pathList};
		},
		setNewLastH() {
				lastH = this.getRandomInt(lastH + 40, lastH + 150);
				if (lastH >= 900) {
						lastH = 960;
				}
		},
		generateSVGPointListFromArray() {
				let _arr = this.generateRandomPointArr();
				return {
						poly: _arr.list.join(' '),
						path: _arr.pathList.join(' ')
				};
		},
		setNewSVGList() {
			let {poly: list, path} = this.generateSVGPointListFromArray();

			this.$nextTick(function () {
				this.$refs.announcePolygon.setAttribute('points', list);
				this.$refs.announceClipPath.setAttribute('d', path);
			});
		},
		getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
	}
});

announce.mount('#app');
