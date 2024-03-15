
export default {
		template: `<div class="alert" v-if="alert.message">
		<h1 v-html="alert.message"></h1>
		<p v-if="alert.subtext">{{alert.subtext}}</p>
	</div>`, 
		props: ['alert'],
};
