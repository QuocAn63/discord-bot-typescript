import { Message } from "discord.js";
import { Trigger } from "./trigger";
import { Logger } from "../services/logger";

export class HelloTrigger implements Trigger {
  triggerd(msg: Message<boolean>): boolean {
    return ["hello", "hi", "xin chào", "xin chao"].includes(
      msg.content.split(" ")[0].toLowerCase()
    );
  }
  async execute(msg: Message<boolean>): Promise<void> {
    await msg.reply("Hello");
  }
}
