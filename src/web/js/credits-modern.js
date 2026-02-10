const { createApp, nextTick, onMounted, ref } = Vue;

const usersPerBatch = 12;
const msBatchVisible = 5000;
const msBatchFade = 1500;

const categoryMap = {
	'onChatMessage': { label: 'Builders', theme: 'builders' },
	'twitch:follow': { label: 'New Followers', theme: 'followers' },
	'twitch:sub': { label: 'Subscribers', theme: 'subscribers' },
	'twitch:giftsub': { label: 'Gift Subs', theme: 'giftsubs' },
	'twitch:raid': { label: 'Raiders', theme: 'raiders' },
	'twitch:cheer': { label: 'Cheers', theme: 'cheers' },
	'twitch:donation': { label: 'Donations', theme: 'donations' },
};

const app = createApp({
	setup() {
		const sections = ref([]);
		const activeSection = ref(null);

		const runCredits = (credits) => {
			sections.value = credits || [];
		};

		const processNextSection = () => {
			if (activeSection.value || sections.value.length === 0) return;

			const { type, users } = sections.value.shift();
			const cat = categoryMap[type];
			if (!cat || !users?.length) {
				// Skip empty or unknown, try next
				setTimeout(processNextSection, 500);
				return;
			}

			const batches = [];
			for (let i = 0; i < users.length; i += usersPerBatch) {
				batches.push(users.slice(i, i + usersPerBatch));
			}

			activeSection.value = {
				label: cat.label,
				theme: cat.theme,
				batches,
				currentBatch: null,
				batchIndex: 0,
			};

			showNextBatch();
		};

		const showNextBatch = () => {
			const s = activeSection.value;
			if (!s) return;

			if (s.batchIndex >= s.batches.length) {
				// All batches shown — fade out section
				setTimeout(() => {
					activeSection.value = null;
				}, 800);
				return;
			}

			s.currentBatch = s.batches[s.batchIndex];
			s.batchIndex++;

			setTimeout(() => {
				// Clear batch to trigger leave transition
				if (activeSection.value) {
					activeSection.value.currentBatch = null;
				}
				// After fade, show next batch or end section
				setTimeout(showNextBatch, msBatchFade);
			}, msBatchVisible);
		};

		onMounted(() => {
			const ws = new WebSocket(`ws://${window.location.host}/socket`);
			ws.onmessage = (e) => {
				const event = JSON.parse(e.data);
				if (event.type === 'onCreditRoll') {
					sections.value = [];
					activeSection.value = null;
					nextTick(() => {
						runCredits(event.payload.credits);
					});
				}
			};
			ws.onopen = () => console.log('Connection opened');
			ws.onerror = (e) => console.error('WebSocket error:', e);
			ws.onclose = () => {
				console.log('Connection closed');
				window.location.reload();
			};

			setInterval(processNextSection, 2000);
		});

		return { activeSection };
	},
	template: `
		<div class="credits-container">
			<transition name="section">
				<div
					v-if="activeSection"
					:key="activeSection.label"
					class="credit-section"
					:class="'theme-' + activeSection.theme"
				>
					<div class="category-header">
						<div class="category-label">{{ activeSection.label }}</div>
						<div class="category-line"></div>
					</div>
					<transition name="batch" mode="out-in">
						<div
							v-if="activeSection.currentBatch"
							:key="activeSection.batchIndex"
							class="user-batch"
						>
							<div
								v-for="(user, i) in activeSection.currentBatch"
								:key="user.login + i"
								class="user-card"
							>
								<div class="user-avatar-ring">
									<img
										class="user-avatar"
										:src="user.avatar_url"
										:alt="user.display_name || user.login"
									/>
								</div>
								<span class="user-name">{{ user.display_name || user.login }}</span>
							</div>
						</div>
					</transition>
				</div>
			</transition>
		</div>
	`,
});

app.mount('#app');
