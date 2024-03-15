import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { defineStore } from  'https://unpkg.com/pinia@2.1.7/dist/pinia.esm-browser.js';

const activityComponentMessages = [
	"stream:mode",
	"twitch:follow",
	"twitch:sub",
	"twitch:raid",
	"twitch:cheer",
	"twitch:giftsub",
]

export const useBarStore = defineStore('barStore', () => {
	const messages = ref([]);
	const icons = ref([
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
	]);
	const currentMode = ref({
		mode: "Focus Time",
		activity: "Coding, Writing, or Designing"
	});
	const activeAlert = ref(null);

	const activityMessages = computed(() => {
		return messages.value.filter(m => activityComponentMessages.includes(m.type));
	});

	function insertMessage(msg) {
		this.messages = [...this.messages, msg];

		// if (type === "stream:mode") {
		// 	commode.value = null;
		// 	setTimeout(() => {
		// 		commode.value = {...defaultMode, ...payload};
		// 	}, 500);
			
		// 	return;
		// }
	}
	function nextActivityMessage(msg) {
		this.activeAlert = this.messages.find(m => activityComponentMessages.includes(m.type));
		this.removeMessage(this.activeAlert);
	}
	function removeMessage(msg) {
		this.messages = this.messages.filter(m => m !== msg);
	}

	return { activeAlert, activityMessages, messages, icons, currentMode, insertMessage, nextActivityMessage, removeMessage};
})
