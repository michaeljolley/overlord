import Supabase from '../supabase';
import { SubscriberStore } from '../../stores/subscriberStore';
import EventBus from '../../eventBus';
import { BotEvents } from '../../botEvents';

export default async (username: string): Promise<void> => {

	const isSubscriber = await SubscriberStore.isSubscriber(username);

	if (isSubscriber) {
		const registeredUser = Supabase.getGiftingRegistration(username);

		// If the user is a subscriber and not registered, we should send a chat
		// message to remind them to register for the gift season.
		if (!registeredUser) {
			const message = `Hey ${username}, we're sending all subscribers a Christmas gift, but you have to register. It looks like we're missing your info, so visit https://bbb.dev/giftseason to learn more & get in on the fun!`;
			EventBus.eventEmitter.emit(BotEvents.OnSay, {payload: { message }});
		}
	}
}
