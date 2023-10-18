import { Message } from "discord.js";
import { TriggerHandler } from "./trigger-handler";

export class MessageHandler {
  constructor(private triggerHandler: TriggerHandler) {}

  public async process(msg: Message): Promise<void> {
    if (msg.system || msg.author.id === msg.client.user.id) {
      return;
    }

    await this.triggerHandler.process(msg);
  }
}
