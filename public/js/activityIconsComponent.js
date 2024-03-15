import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

import IconComponent from './iconComponent.js';

export default {
	components: {
		'icon': IconComponent
	},
	setup() {

		const icons = ref(defaultIcons);
		const update = ref('');
		const iconIndex = ref(0);
		const activeIcon = ref(null);
	
		// const processUpdate = function (type, payload) {
		// 	switch (type) {
		// 		case "stream:icon:increment":
		// 			const icon = icons.value.find(i => i.name === payload.name);
		// 			icon.count++;
		// 			break;
		// 		case "stream:icon:reset":
		// 			icons.value = defaultIcons;
		// 			break;
		// 	}
		// }
		
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
	},
	template: `<div id="icons">
	<div class="list">
		<icon v-for="icon in icons" :icon="icon" :active="activeIcon" :key="icon.id" />
	</div>
	<p>{{update}}</p>
</div>`
};
