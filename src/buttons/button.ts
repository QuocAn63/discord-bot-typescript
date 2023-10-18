import { ButtonInteraction, Message } from "discord.js";
import { EventData } from "../models/external-model";

export interface Button {
  ids: string[];
  deferType: ButtonDeferType;
  execute(
    intr: ButtonInteraction,
    msg: Message,
    data?: EventData
  ): Promise<void>;
}

export enum ButtonDeferType {
  REPLY = "REPLY",
  UPDATE = "UPDATE",
  NONE = "NONE",
}
