import { User } from "./user";

export class Task {
  constructor(
    public user: User,
		public title: string
  ) { }

	public isDone: boolean = false;
}
