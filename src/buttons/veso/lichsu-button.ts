import {
  APIEmbed,
  APIEmbedField,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  Message,
} from "discord.js";
import { Button, ButtonDeferType } from "../button";
import { EmbedUtils } from "../../services";
import lang from "../../../lang/lang.json";
import config from "../../../config/config.json";
import { InteractionUtils } from "../../utils/interaction-utils";
import { DateUtils, ListButtonUtils } from "../../utils";
import { DrawRepo } from "../../services/database/repo";
export class LichSuButton implements Button {
  public ids = ["lichsu_prev", "lichsu_next"];
  public deferType = ButtonDeferType.UPDATE;

  constructor(private drawRepo: DrawRepo) {}

  public async execute(intr: ButtonInteraction, msg: Message): Promise<void> {
    let embed = msg.embeds[0];
    let footer = embed.footer?.text;
    let guildDiscordId = intr.guildId as string;

    if (!footer) return;

    let match = RegExp(/Page (\d+)\/(\d+)/).exec(footer);

    if (!match) return;

    let page = Number.parseInt(match[1]);
    let total = Number.parseInt(match[2]);

    let { page: newPageNum } = ListButtonUtils.getNewPageNumber(
      intr.customId,
      page,
      total
    );

    let fetchedDrawSessionResultList =
      await this.drawRepo.getDrawSessionResults(guildDiscordId, {
        page: newPageNum,
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

    let newEmbed: APIEmbed = {
      ...lang.embeds.lichsuxoso,
      fields: [...lang.embeds.lichsuxosoHeaders, ...drawSessionResultListEmbed],
    };

    newEmbed = EmbedUtils.addVariables(newEmbed, {
      CURRENT_PAGE: newPageNum.toString(),
      TOTAL_PAGE: fetchedDrawSessionResultList[0].totalPages.toString(),
    });

    await InteractionUtils.editReply(intr, {
      embeds: [newEmbed],
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
  }
}
