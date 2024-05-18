import { OnCommandExtra, OnMessageFlags } from "comfy.js";

export class OnCommandEvent {
  constructor(
    public user: string,
    public command: string,
    public message: string,
    public flags: OnMessageFlags,
    public extra: OnCommandExtra,
  ) {
    this.event = {
      message,
      command,
    };
  }

  event: {
    message: string;
    command: string;
  };
}
