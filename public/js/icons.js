

const defaultIcons = [
	{
		name: 'videoScripts',
		niceName: "video scripts written",
		count: 0
	},
	{
		name: 'videoRecordings',
		niceName: "videos recorded",
		count: 0
	},
	{
		name: 'videoEdits',
		niceName: "videos edited",
		count: 0
	},
	{
		name: 'videoUploads',
		niceName: "videos uploaded",
		count: 0
	}
]

const icon = createApp({
		setup() {

			const icons = ref(defaultIcons);
			const update = ref('');
			const iconIndex = ref(0);
			const activeIcon = ref(null);

			const webSocket = ref(new WebSocket(`ws://${window.location.host}/socket`));

			webSocket.value.onmessage = function(e) {
				const event = JSON.parse(e.data);
				processUpdate(event.type, event.payload);
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

			const processUpdate = function (type, payload) {
				switch (type) {
					case "stream:icon:increment":
						const icon = icons.value.find(i => i.name === payload.name);
						icon.count++;
						break;
					case "stream:icon:reset":
						icons.value = defaultIcons;
						break;
				}
			}
			
			const onInterval = function() {
				const totalIcons = icons.value.length;

				if (iconIndex.value >= totalIcons - 1) {
					iconIndex.value = 0;
				} else {
					iconIndex.value++;
				}

				activeIcon.value = icons.value[iconIndex.value];
				update.value = `${activeIcon.value?.count || 0} ${activeIcon.value.niceName}`;
			}

			setInterval(onInterval, 5000);

			return { icons, update, activeIcon }
		}
	});
	
	icon.component(
		'icon',
		{
			template: `<div class="icon" :class="{active: isActive }">
			<img :src="'/images/' + icon.name + '.svg'" />
			<p>{{icon.count}}</p>
		</div>`, 
			props: ['icon', 'active'],
			computed: {
				isActive() {
					return this.active && this.icon.name === this.active.name ? 'active' : '';
				}
			}
		}
	)
	
	icon.mount('#icons')

