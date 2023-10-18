import {
  APIEmbed,
  CommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Command, CommandDeferType } from "../command";
import lang from "../../../lang/lang.json";
import { InteractionUtils } from "../../utils/interaction-utils";

export class TroGiupCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "trogiup",
    description: "Hiển thị các câu lệnh và cách sử dụng",
  };
  public requireClientPerms = [];
  public requireSetup = false;
  public deferType = CommandDeferType.HIDDEN;
  public async execute(intr: CommandInteraction): Promise<void> {
    let embed: APIEmbed = lang.embeds.trogiup;

    await InteractionUtils.editReply(intr, { embeds: [embed] });
  }
}
