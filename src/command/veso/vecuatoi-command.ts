import {
  APIActionRowComponent,
  APIEmbed,
  APIEmbedField,
  APIMessageActionRowComponent,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  Embed,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Command, CommandDeferType } from "../command";
import lang from "../../../lang/lang.json";
import config from "../../../config/config.json";
import { InteractionUtils } from "../../utils/interaction-utils";
import { EmbedUtils, Logger } from "../../services";
import { DrawRepo } from "../../services/database/repo";
import { DateUtils } from "../../utils";

export class VeCuaToiCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "vecuatoi",
    description: "Hôm nay bạn đã tham gia Xổ Số Kiến Cắn chưa?",
  };
  public requireSetup = false;
  public requireClientPerms = [];
  public deferType = CommandDeferType.HIDDEN;

  constructor(private drawRepo: DrawRepo) {}

  public async execute(intr: CommandInteraction): Promise<void> {
    let userId = intr.user.id;
    let guildId = intr.guildId;

    if (!guildId) {
      await intr.followUp({ content: "Không tìm thấy Guild Discord ID" });
      return;
    }

    let fetchedUserTickets = await this.drawRepo.getUserTickets(
      guildId,
      userId,
      {
        page: 1,
        pageSize: 6,
      }
    );

    if (!fetchedUserTickets.tickets.length) {
      await InteractionUtils.send(intr, {
        content:
          "Bạn chưa từng tham gia chương trình. Sử dụng lệnh **/muaveso** để tham gia.\n**/trogiup** để tìm hiểu thêm các câu lệnh khác.",
      });
      return;
    }

    let checkedTicketsEmbed: APIEmbedField[] = [];

    for (let ticket of fetchedUserTickets.tickets) {
      checkedTicketsEmbed.push(
        ...(EmbedUtils.addVariables(lang.embeds.vecuatoiField as APIEmbed, {
          DRAW_ID: ticket.drawSessionId,
          JOIN_DATE: new DateUtils(ticket.buyAtTime).toString(),
          IS_MATCHED: ticket.number === ticket.result ? "Trúng" : "Không trúng",
        }) as APIEmbedField[])
      );
    }

    let embed: APIEmbed = {
      ...lang.embeds.vecuatoiHeader,
      ...lang.embeds.vecuatoiFooter,
      fields: [...lang.embeds.vecuatoiFieldHeader, ...checkedTicketsEmbed],
    };

    embed = EmbedUtils.addVariables(embed, {
      CURRENT_PAGE: fetchedUserTickets.metadata.page.toString(),
      TOTAL_PAGE: fetchedUserTickets.tickets[0].totalPages.toString(),
    }) as APIEmbed;

    await InteractionUtils.send(intr, {
      embeds: [embed],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              customId: "vecuatoi_prev",
              emoji: config.emotes.previous,
              style: ButtonStyle.Primary,
            },
            {
              type: ComponentType.Button,
              customId: "vecuatoi_next",
              emoji: config.emotes.next,
              style: ButtonStyle.Primary,
            },
          ],
        },
      ],
    });
  }
}
