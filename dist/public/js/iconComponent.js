export default {
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
