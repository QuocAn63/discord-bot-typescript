import { Message } from "discord.js";
import { EventData } from "../models/external-model";

export interface Trigger {
  triggerd(msg: Message): boolean;
  execute(msg: Message, data?: EventData): Promise<void>;
}
