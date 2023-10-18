import { CommandInteraction } from "discord.js";
import { Command, CommandDeferType } from "../command/command";
import { EventHandler } from "./event-handler";
import { Logger } from "../services/logger";
import { EventData } from "../models/external-model";
import { InteractionUtils } from "../utils/interaction-utils";

export class CommandHandler implements EventHandler {
  constructor(private commands: Command[]) {}

  public async process(intr: CommandInteraction): Promise<void> {
    if (intr.user.id === intr.client.user?.id || intr.user.bot) {
      return;
    }

    let command = this.commands.find(
      (command) => command.metadata.name === intr.commandName
    );

    if (!command) {
      Logger.error(
        `[INTERACTION_ID]: ${intr.id}:  Command [${intr.commandName}] not found`
      );
      return;
    }

    switch (command.deferType) {
      case CommandDeferType.HIDDEN:
        await InteractionUtils.deferReply(intr, true);
        break;
      case CommandDeferType.PUBLIC:
        await InteractionUtils.deferReply(intr, false);
        break;
    }

    if (command.deferType !== CommandDeferType.NONE && !intr.deferred) {
      return;
    }

    try {
      await command.execute(intr);
    } catch (err) {
      Logger.error(
        `[INTERACTION_ID]: ${intr.id}\n[CommandName]: ${command.metadata.name}\n[Executed by]: ${intr.user.displayName}(${intr.user.id}\n${intr.user.tag})\n[At Channel]: ${intr.channelId}\n[At Guild]: ${intr.guild?.name}(${intr.guildId})]`,
        err
      );
    }
  }

  private async sendError(
    intr: CommandInteraction,
    data: EventData
  ): Promise<void> {
    try {
      await InteractionUtils.send(
        intr,
        `[INTERACTION_ID]: ${intr.id}\nGUILD_ID: ${intr.guildId}`
      );
    } catch {
      // Ignore
    }
  }
}
