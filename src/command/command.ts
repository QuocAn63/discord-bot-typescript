import {
  CommandInteraction,
  PermissionsString,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { EventData } from "../models/external-model";

export interface Command {
  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;
  deferType: CommandDeferType;
  requireClientPerms: PermissionsString[];
  requireSetup: boolean;
  execute(intr: CommandInteraction, data?: EventData): Promise<void>;
}

export enum CommandDeferType {
  PUBLIC = "PUBLIC",
  HIDDEN = "HIDDEN",
  NONE = "NONE",
}
