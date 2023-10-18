import { Message } from "discord.js";
import { Trigger } from "../triggers";

export class TriggerHandler {
  constructor(private triggers: Trigger[]) {}

  public async process(msg: Message): Promise<void> {
    let triggers = this.triggers.filter((trigger) => trigger.triggerd(msg));

    if (triggers.length === 0) return;

    for (let trigger of triggers) {
      await trigger.execute(msg);
    }
  }
}
