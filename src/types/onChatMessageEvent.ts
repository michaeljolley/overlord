import { OnMessageExtra, OnMessageFlags } from "comfy.js";
import { StreamUser } from "./streamUser";

export class OnChatMessageEvent  {
  constructor(
    public user: StreamUser, 
    public message: string,
		public sanitizedMessage: string,
    public flags: OnMessageFlags,
    public self: boolean,
    public extra: OnMessageExtra,
    public id: string
  ) { 
  }
}
