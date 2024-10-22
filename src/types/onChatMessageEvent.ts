import { OnMessageExtra, OnMessageFlags } from "comfy.js";
import { User } from "./user";

export class OnChatMessageEvent  {
  constructor(
    public user: User, 
    public message: string,
		public sanitizedMessage: string,
    public flags: OnMessageFlags,
    public self: boolean,
    public extra: OnMessageExtra,
    public id: string,
		public todos: { total: number, completed: number }
  ) { 
  }
}
