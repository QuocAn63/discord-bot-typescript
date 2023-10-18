import {
  APIEmbed,
  APIEmbedField,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Command, CommandDeferType } from "../command";
import config from "../../../config/config.json";
import lang from "../../../lang/lang.json";
import { InteractionUtils } from "../../utils/interaction-utils";
import { EmbedUtils } from "../../services";
import { DrawRepo } from "../../services/database/repo";
import { DateUtils } from "../../utils";

export class LichSuXoSoCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "lichsuxoso",
    description: "Tra cứu lịch sử các phiên xổ số",
  };
  public requireClientPerms = [];
  public requireSetup = false;
  public deferType = CommandDeferType.PUBLIC;
  constructor(private drawRepo: DrawRepo) {}

  public async execute(intr: CommandInteraction): Promise<void> {
    let guildDiscordId = intr.guildId as string;

    try {
      let fetchedDrawSessionResultList =
        await this.drawRepo.getDrawSessionResults(guildDiscordId, {
          page: 1,
          pageSize: 6,
        });

      let drawSessionResultListEmbed: APIEmbedField[] = [];

      for (let ds of fetchedDrawSessionResultList) {
        drawSessionResultListEmbed.push(
          ...(EmbedUtils.addVariables(lang.embeds.lichsuxosoField as APIEmbed, {
            DRAW_ID: ds.id,
            DRAW_TIME: new DateUtils(ds.drawAt).toString(),
            RESULT: ds.result ? ds.result.toString() : "Chưa xổ",
          }) as APIEmbedField[])
        );
      }

      let embed: APIEmbed = {
        ...lang.embeds.lichsuxoso,
        fields: [
          ...lang.embeds.lichsuxosoHeaders,
          ...drawSessionResultListEmbed,
        ],
      };
      embed = EmbedUtils.addVariables(embed, {
        CURRENT_PAGE: "1",
        TOTAL_PAGE: fetchedDrawSessionResultList[0].totalPages.toString(),
      });

      await InteractionUtils.send(intr, {
        embeds: [embed],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                customId: "lichsu_prev",
                emoji: config.emotes.previous,
                style: ButtonStyle.Primary,
              },
              {
                type: ComponentType.Button,
                customId: "lichsu_next",
                emoji: config.emotes.next,
                style: ButtonStyle.Primary,
              },
            ],
          },
        ],
      });
    } catch (err) {
      await InteractionUtils.send(intr, {
        content: "Lỗi trong quá trình xử lý câu lệnh. Vui lòng thử lại sau.",
        ephemeral: true,
      });
      throw err;
    }
  }
}
