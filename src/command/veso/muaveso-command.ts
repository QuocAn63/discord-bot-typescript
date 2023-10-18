import {
  APIEmbed,
  ApplicationCommandOptionType,
  CommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Command, CommandDeferType } from "../command";
import config from "../../../config/config.json";
import lang from "../../../lang/lang.json";
import { EmbedUtils, Logger } from "../../services";
import { DrawRepo, GuildRepo } from "../../services/database/repo";
import { DateUtils } from "../../utils";
import { UserRepo } from "../../services/database/repo/user-repo";

export class MuaVeSoCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "muaveso",
    description: "Mua vé số đeeeeee!",
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: "luckynumber",
        description: `Nhập số may mắn từ ${config.veso.min} đến ${config.veso.max}`,
        type: ApplicationCommandOptionType.Number,
        required: false,
      },
    ],
  };
  public deferType = CommandDeferType.PUBLIC;
  public requireClientPerms = [];
  public requireSetup = false;

  constructor(
    private drawRepo: DrawRepo,
    private guildRepo: GuildRepo,
    private userRepo: UserRepo
  ) {}

  public async execute(intr: CommandInteraction): Promise<void> {
    let option = intr.options.get("luckynumber")?.value;
    let luckyNumber: number;
    let { min: minNumber, max: maxNumber } = config.veso;
    let embed: APIEmbed;
    let guildId = intr.guildId;

    if (!guildId) return;

    // saving user id if not exists in db
    await this.userRepo.createUserIfNotExists(intr.user.id);

    // check user already in guild
    let isAlreadyInGuild = await this.guildRepo.checkUserInGuild(
      guildId,
      intr.user.id
    );

    if (!isAlreadyInGuild) {
      await this.guildRepo.setUserInGuild(guildId, intr.user.id);
    }

    // get latest draw session with not draw yet
    let latestDrawSessionResult = await this.drawRepo.getLatestDrawSession(
      guildId
    );

    if (!latestDrawSessionResult) {
      await intr.followUp({
        content:
          "Phiên xổ số mới hiện chưa được khởi tạo. Vui lòng thử lại sau.",
        ephemeral: true,
      });
      return;
    }

    // check user already joined this draw session
    let isAlreadyJoinedSession = await this.drawRepo.checkUserAlreadyJoined(
      latestDrawSessionResult.drawSession,
      intr.user.id
    );

    if (isAlreadyJoinedSession) {
      await intr.followUp({
        content:
          "Bạn đã đăng ký tham gia phiên xổ số này rồi.Dùng lệnh **\\vecuatoi** để kiểm tra.",
        ephemeral: true,
      });
      return;
    }

    if (!option) {
      luckyNumber = Math.floor(
        Math.random() * (maxNumber - minNumber) + minNumber
      );
    } else {
      switch (typeof option) {
        case "string":
          luckyNumber = Number.parseInt(option);
          break;
        case "number":
          luckyNumber = option;
          break;
        default:
          return;
      }
    }

    if (luckyNumber <= minNumber || luckyNumber >= maxNumber) {
      await intr.followUp({
        content: `Vui lòng nhập một con số hợp lệ từ ${minNumber} đến ${maxNumber}`,
        ephemeral: true,
      });
      return;
    }

    // saving user ticket
    try {
      await this.drawRepo.storeUserTicket(
        latestDrawSessionResult.drawSession.id,
        intr.user.id,
        luckyNumber
      );
    } catch (err) {
      await intr.followUp({
        content: `Lỗi khi lưu vé. Vui lòng thử lại.`,
        ephemeral: true,
      });
      return;
    }

    embed = EmbedUtils.addVariables(
      { ...lang.embeds.muaveso },
      {
        USERNAME: intr.user.displayName,
        DRAW_ID: latestDrawSessionResult.drawSession.id,
        DRAW_TIME: new DateUtils(latestDrawSessionResult.drawSession.drawAt)
          .add(1, "d")
          .toString(),
        CURRENT_TIME: new DateUtils().toString(),
        LUCKY_NUMBER: luckyNumber.toString(),
        PRIZE: latestDrawSessionResult.guild.prize,
      }
    );

    await intr.followUp({ embeds: [embed] });
  }
}
