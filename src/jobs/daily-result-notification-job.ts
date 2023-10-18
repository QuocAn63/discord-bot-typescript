import Job from "./job";
import config from "../../config/config.json";
import { CustomClient } from "../extensions/custom-client";
import { DailyNotificationService } from "../services";
import { DateUtils, RandomUtils } from "../utils";
import { DrawRepo, GuildRepo } from "../services/database/repo";
import { TextBasedChannel } from "discord.js";
export class DailyResultNotificationJob implements Job {
  public name = "Daily Notify Results";
  public log = true;
  public schedule = "*/30 */16 * * *";

  constructor(
    private client: CustomClient,
    private guildRepo: GuildRepo,
    private drawRepo: DrawRepo,
    private dailyNotificationService: DailyNotificationService
  ) {}

  public async run(fireDate: Date) {
    let guildsList = await this.guildRepo.getGuildList();

    for (let guildData of guildsList) {
      let guild = await this.client.guilds.fetch(guildData.guildDiscordId);
      let channel = (await guild.channels.fetch(
        guildData.channelDiscordId
      )) as TextBasedChannel;
      if (!channel) return;

      // get latest drawSession that not draw yet
      let drawSessionResult = await this.drawRepo.getLatestDrawSession(
        guild.id
      );

      if (!drawSessionResult) return;

      let minValue = config.veso.min;
      let maxValue = config.veso.max;
      let randomNumber = RandomUtils.randomNumber(minValue, maxValue);
      let winners = [];

      let tickets = await this.drawRepo.getUsersTicket(
        drawSessionResult.drawSession.id
      );

      // finding user who have ticket number matches the lucky number
      for (let ticket of tickets) {
        if (ticket.number === randomNumber) winners.push(ticket);
      }

      drawSessionResult.drawSession.result = randomNumber;
      drawSessionResult.drawSession.drawAt = new DateUtils().toString();

      // saving new drawSession result
      await this.drawRepo.updateDrawSession(drawSessionResult.drawSession);

      // updating winner win total
      for (let winner of winners) {
        await this.guildRepo.increaseUserTotalWin(
          guild.id,
          winner.userDiscordId
        );
      }
      await this.dailyNotificationService.run(
        this.client,
        channel,
        drawSessionResult.guild,
        drawSessionResult.drawSession,
        winners
      );
    }
  }
}
