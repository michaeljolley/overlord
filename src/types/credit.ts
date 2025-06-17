import { User } from "./user";

export class Credit {
  constructor(
    public type: string,
    public user: User
  ) { }
}

export type CreditRoll = {
	type: string;
	users: User[];
}
