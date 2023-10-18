export class RegexUtils {
  public static getPageNumber(
    input: string
  ): { page: number; total: number } | undefined {
    let match = new RegExp(/Page (\d+)\/(\d+)/).exec(input);
    if (!match) {
      return;
    }

    return {
      page: Number.parseInt(match[1]),
      total: Number.parseInt(match[2]),
    };
  }
}
