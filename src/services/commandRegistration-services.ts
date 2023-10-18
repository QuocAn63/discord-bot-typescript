import {
  REST,
  RESTGetAPIApplicationCommandsResult,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import config from "../../config/config.json";
import { Logger } from "./logger";

export class CommandRegistraion {
  constructor(private clientId: string, private rest: REST) {}

  public async process(
    localCmds: RESTPostAPIChatInputApplicationCommandsJSONBody[],
    args: "register" | "delete"
  ): Promise<void> {
    let remoteCmds = (await this.rest.get(
      Routes.applicationCommands(this.clientId)
    )) as RESTGetAPIApplicationCommandsResult;

    let localCmdsOnRemote = localCmds.filter((localCmd) =>
      remoteCmds.some((remoteCmd) => remoteCmd.name === localCmd.name)
    );

    let localCmdsOnly = localCmds.filter(
      (localCmd) =>
        !remoteCmds.some((remoteCmd) => remoteCmd.name === localCmd.name)
    );

    let remoteCmdsOnly = remoteCmds.filter(
      (remoteCmd) =>
        !localCmds.some((localCmd) => localCmd.name === remoteCmd.name)
    );

    switch (args) {
      case "delete":
        for (let remoteCmd of remoteCmds) {
          Logger.info(
            `[COMMAND_DELETING]: Deleteing '${remoteCmd.name}' command`
          );
          await this.rest.delete(
            Routes.applicationCommand(this.clientId, remoteCmd.id)
          );
          Logger.info(
            `[COMMAND_DELETING]: Command '${remoteCmd.name}' deleted.`
          );
        }
        break;
      case "register":
        if (localCmdsOnly.length > 0) {
          for (let localCmd of localCmdsOnly) {
            Logger.info(
              `[COMMAND_REGISTRATION]: Registering '${localCmd.name}' command`
            );
            await this.rest.post(Routes.applicationCommands(this.clientId), {
              body: localCmd,
            });
            Logger.info(
              `[COMMAND_REGISTRATION]: Command '${localCmd.name}' registed.`
            );
          }
        }

        if (remoteCmdsOnly.length > 0) {
          for (let remoteCmd of remoteCmdsOnly) {
            Logger.info(
              `[COMMAND_REGISTRATION]: Registering ${remoteCmd.name} command`
            );
            await this.rest.post(Routes.applicationCommands(this.clientId), {
              body: remoteCmd,
            });
            Logger.info(
              `[COMMAND_REGISTRATION]: Command ${remoteCmd.name} registed.`
            );
          }
        }
        break;
    }
  }
}
