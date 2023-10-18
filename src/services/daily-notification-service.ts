import { APIEmbed, TextBasedChannel } from "discord.js";
import UserWithDrawData from "../models/database/userWithDraw-model";
import DrawSessionData from "../models/database/drawSession-model";
import { DateUtils, MessageUtils } from "../utils";
import lang from "../../lang/lang.json";
import { EmbedUtils } from "../utils/embed-utils";
import { GuildsDrawData } from "../models/database";
import { CustomClient } from "../extensions/custom-client";
import moment from "moment";

// Notify daily draw result to channels
export class DailyNotificationService {
  public async run(
    client: CustomClient,
    channel: TextBasedChannel,
    guildsDraw: GuildsDrawData,
    drawSession: DrawSessionData,
    winners: UserWithDrawData[]
  ): Promise<void> {
    let embed: APIEmbed = lang.embeds.thongbaoketquahangngay;

    embed = EmbedUtils.addVariables(embed, {
      DRAW_ID: drawSession.id,
      DRAW_TIME: new DateUtils().toString(),
      LUCKY_NUMBER: (drawSession.result as number).toString(),
    });

    await MessageUtils.send(channel, { embeds: [embed] });

    if (winners.length !== 0) {
      let winnerEmbed: APIEmbed = lang.embeds.thongbaoketquahangngayFollowup;
      let taggedUsers = winners
        .map((user) => {
          let cachedUser = client.users.cache.get(user.userDiscordId);

          if (!cachedUser) return;

          return `${cachedUser.toString()}`;
        })
        .join(", ");
      winnerEmbed = EmbedUtils.addVariables(winnerEmbed, {
        WINNERS: taggedUsers,
        DRAW_ID: drawSession.id,
        PRIZE: guildsDraw.prize,
      });
      await MessageUtils.send(channel, { embeds: [winnerEmbed] });
    }
  }
}
