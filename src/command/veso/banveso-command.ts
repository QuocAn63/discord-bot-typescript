import {
  APIEmbed,
  ApplicationCommandOptionType,
  CommandInteraction,
  PermissionsString,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Command, CommandDeferType } from "../command";
import lang from "../../../lang/lang.json";
import { InteractionUtils } from "../../utils/interaction-utils";
import { EmbedUtils } from "../../services";
import { DrawRepo, GuildRepo } from "../../services/database/repo";

export class BanVeSoCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "banveso",
    description: "Khởi tạo BOT Bán vé số tại channel này.",
    options: [
      {
        name: "prize",
        description: "Mô tả phần thưởng",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "drawtime",
        description: "Thời gian quay số (HH:MM) (Mặc định 16:30 hằng ngày)",
        type: ApplicationCommandOptionType.String,
      },
    ],
  };
  public requireClientPerms: PermissionsString[] = ["Administrator"];
  public requireSetup = false;
  public deferType = CommandDeferType.PUBLIC;

  constructor(private guildRepo: GuildRepo, private drawRepo: DrawRepo) {}

  public async execute(intr: CommandInteraction): Promise<void> {
    let { guild, channel } = intr;
    let embed: APIEmbed;
    let drawTime =
      intr.options.get("drawtime")?.value !== undefined
        ? intr.options.get("drawtime")?.value + ":00"
        : "16:30:00";
    let prize = intr.options.get("prize")?.value as string;

    if (!guild) {
      await InteractionUtils.editReply(intr, {
        content: "Không tìm thấy Guild Discord ID.",
      });
      return;
    }

    if (!channel?.isTextBased) {
      await InteractionUtils.editReply(intr, {
        content: "Yêu cầu một kênh chat để khởi tạo Bot.",
      });
      return;
    }

    try {
      let getDrawCreatingResult = await this.drawRepo.setupGuildsDraw(
        guild,
        channel,
        `'${drawTime}'`,
        prize
      );

      if (!getDrawCreatingResult) {
        await InteractionUtils.editReply(intr, {
          content: "Lỗi không xác định.",
        });
        return;
      }

      embed = EmbedUtils.addVariables(lang.embeds.banveso, {
        GUILD_NAME: guild ? guild.name : "UNKNOWN",
        CHANNEL_NAME: channel.toString(),
        AUTHOR_NAME: intr.client.user.displayName,
        DRAW_TIME: drawTime,
        PRIZE: prize,
      });

      await InteractionUtils.send(intr, { embeds: [embed] });
    } catch (err) {
      await InteractionUtils.send(intr, {
        content: "Lỗi trong quá trình xử lý câu lệnh. Vui lòng thử lại sau.",
        ephemeral: true,
      });
      throw err;
    }
  }
}
