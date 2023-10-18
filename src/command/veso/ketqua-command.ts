import {
  APIEmbed,
  ApplicationCommandOptionType,
  CommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Command, CommandDeferType } from "../command";
import { InteractionUtils } from "../../utils/interaction-utils";
import { EmbedUtils } from "../../services";
import lang from "../../../lang/lang.json";
import { DrawRepo } from "../../services/database/repo";
import { DateUtils } from "../../utils";

export class KetQuaXoSoCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "ketquasoxo",
    description: "Xem thông tin kết quả sổ xố",
    default_member_permissions: undefined,
    dm_permission: undefined,
    options: [
      {
        name: "id",
        description:
          "Nhập mã vòng quay (bỏ trống sẽ trả về Kết quả của vòng quay gần nhất)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  };
  public requireSetup = false;
  public requireClientPerms = [];
  public deferType = CommandDeferType.PUBLIC;

  constructor(private drawRepo: DrawRepo) {}

  public async execute(intr: CommandInteraction): Promise<void> {
    let option = intr.options.get("id")?.value;
    let guildDiscordId = intr.guildId as string;

    let embed: APIEmbed;

    if (option !== undefined && typeof option !== "string") {
      await InteractionUtils.send(intr, {
        content: "Lỗi khi xử lý tham số. Vui lòng thử lại.",
      });
      return;
    }

    try {
      let fetchedDrawSessionResult = await this.drawRepo.getDrawSessionResult(
        guildDiscordId,
        intr.user.id,
        option
      );

      embed = EmbedUtils.addVariables(lang.embeds.ketquaxoso, {
        DRAW_ID: fetchedDrawSessionResult.id,
        DRAW_TIME: new DateUtils(fetchedDrawSessionResult.drawAt).toString(),
        RESULT: fetchedDrawSessionResult.result
          ? fetchedDrawSessionResult.result.toString()
          : "Chưa xổ",
        NUMBER: fetchedDrawSessionResult.userChoice
          ? fetchedDrawSessionResult.userChoice.toString()
          : "Không có",
      });

      await InteractionUtils.send(intr, {
        embeds: [embed],
        ephemeral: true,
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
