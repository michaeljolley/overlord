import EventBus from "../../../eventBus";
import { OnCommandEvent } from '../../../types/onCommandEvent';
import { BotEvents } from "../../../botEvents";
import { TaskStore } from "../../../stores/taskStore";
import { Task } from "../../../types/task";
import { UserStore } from "../../../stores/userStore";

/**
 * Sends a message to chat with details about Michael's Twitter
 * @param onCommandEvent
 */
export const todo = async (onCommandEvent: OnCommandEvent): Promise<void> => {

	const words = onCommandEvent.message.split(' ');

	const command = words.shift();

	if (command) {

		switch (command.toLowerCase()) {
			case 'done':

				const todo = await TaskStore.getTask(onCommandEvent.user);
				if (todo) {
					todo.isDone = true;
					TaskStore.setTask(todo);
					
					// Send the message to Twitch chat
					EventBus.eventEmitter.emit(BotEvents.OnSay, { message: `@${onCommandEvent.user} has completed their task!` });
				}
					
				break;

			default:

				const title = words.join(' ');

				const existingTodo = await TaskStore.getTask(onCommandEvent.user);
				if (existingTodo) {
					existingTodo.title = title;
					TaskStore.setTask(existingTodo);
				} else {
					const user = await UserStore.getUser(onCommandEvent.user);
					if (user) {
						TaskStore.setTask(new Task(user, title));

						// Send the message to Twitch chat
						EventBus.eventEmitter.emit(BotEvents.OnSay, { message: `@${onCommandEvent.user} has added a todo to the list: ${onCommandEvent.message}` });
					}
				}
						
				break;
		}
	}
}
