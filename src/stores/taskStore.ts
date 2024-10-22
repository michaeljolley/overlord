import { BotEvents } from "../botEvents";
import EventBus from "../eventBus";
import { Task } from "../types/task";

export abstract class TaskStore {

	static tasks: Task[] = [];

	public static getTask = (username: string): Task | undefined => this.tasks.find(task => task.user.login === username && !task.isDone);

	public static getUserTasks = (username: string): { total: number, completed: number } => {
		const userTasks = this.tasks.filter(task => task.user.login === username);
		
		return {
			total: userTasks.length,
			completed: userTasks.filter(task => task.isDone).length,
		}
	}

	public static setTask = (task: Task): void => {
		if (!task.isDone) {
			const index = this.tasks.findIndex(t => t.user.login === task.user.login && !t.isDone);
			if (index === -1) {
				this.tasks.push(task);
			} else {
				this.tasks[index] = task;
			}
		}

		EventBus.eventEmitter.emit(BotEvents.OnTodoUpdated, { todos: this.tasks });
	}
}
