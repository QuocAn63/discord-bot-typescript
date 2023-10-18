import { APIEmbed } from "discord.js";

export class EmbedUtils {
  public static addVariables(
    embed: APIEmbed[] | APIEmbed,
    obj: { [key: string]: string }
  ): APIEmbed {
    let json = JSON.stringify(embed);
    let keys = Object.keys(obj);

    for (let key of keys) {
      json = json.replaceAll(`{:${key}}`, obj[key]);
    }

    return JSON.parse(json);
  }
}
