import { CustomClient } from "../extensions/custom-client";
import { EmbedUtils, Logger } from "../services";
import { DrawRepo, GuildRepo } from "../services/database/repo";
import Job from "./job";
import lang from "../../lang/lang.json";
import { APIEmbed, TextBasedChannel } from "discord.js";
import { DateUtils, MessageUtils } from "../utils";

export class CreateNewDrawSessionJob implements Job {
  public name = "Create new daily draw session";
  public log = false;
  public schedule = "*/31 */16 * * *";

  constructor(
    private client: CustomClient,
    private guildRepo: GuildRepo,
    private drawRepo: DrawRepo
  ) {}

  public async run(): Promise<void> {
    let fetchedGuildList = await this.guildRepo.getGuildList();

    for (let fetchedGuildData of fetchedGuildList) {
      let guild = await this.client.guilds.fetch(
        fetchedGuildData.guildDiscordId
      );
      let channel = (await this.client.channels.fetch(
        fetchedGuildData.channelDiscordId
      )) as TextBasedChannel;

      if (!channel) continue;

      let drawSessionId = `DS-${guild.id}-${new Date().getTime()}`;

      try {
        await this.drawRepo.createDrawSession(drawSessionId, guild.id);
        let embed: APIEmbed = lang.embeds.thongbaophienxosomoi;

        embed = EmbedUtils.addVariables(embed, {
          DRAW_ID: drawSessionId,
          PRIZE: fetchedGuildData.prize,
          DRAW_TIME: new DateUtils().toString(),
        });

        await MessageUtils.send(channel, { embeds: [embed] });
      } catch (err) {
        Logger.error("[CreateNewDrawSessionJob]:", err);
        continue;
      }
    }
  }
}
