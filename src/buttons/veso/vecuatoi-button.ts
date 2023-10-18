import {
  APIEmbed,
  APIEmbedField,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  Message,
} from "discord.js";
import { Button, ButtonDeferType } from "../button";
import { DateUtils, ListButtonUtils, RegexUtils } from "../../utils";
import lang from "../../../lang/lang.json";
import config from "../../../config/config.json";
import { EmbedUtils, Logger } from "../../services";
import { InteractionUtils } from "../../utils/interaction-utils";
import { DrawRepo } from "../../services/database/repo";

export class VeCuaToiButton implements Button {
  public ids = ["vecuatoi_prev", "vecuatoi_next"];
  public deferType = ButtonDeferType.UPDATE;

  constructor(private drawRepo: DrawRepo) {}

  public async execute(intr: ButtonInteraction, msg: Message): Promise<void> {
    let guildId = intr.guildId;
    let userId = intr.user.id;
    let embed = msg.embeds[0];
    let footer = embed.footer?.text;

    if (!footer) return;
    if (!guildId) return;

    let pageInfo = RegexUtils.getPageNumber(footer);

    if (!pageInfo) return;

    let { page, total } = pageInfo;
    let { page: newPageNum } = ListButtonUtils.getNewPageNumber(
      intr.customId,
      page,
      total
    );
    let fetchedUserTickets = await this.drawRepo.getUserTickets(
      guildId,
      userId,
      {
        page,
        pageSize: 6,
      }
    );

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

    let newEmbed: APIEmbed = {
      ...lang.embeds.vecuatoiHeader,
      ...lang.embeds.vecuatoiFooter,
      fields: [...lang.embeds.vecuatoiFieldHeader, ...checkedTicketsEmbed],
    };

    newEmbed = EmbedUtils.addVariables(newEmbed, {
      CURRENT_PAGE: newPageNum.toString(),
      TOTAL_PAGE: total.toString(),
    });

    await InteractionUtils.editReply(intr, {
      embeds: [newEmbed],
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
