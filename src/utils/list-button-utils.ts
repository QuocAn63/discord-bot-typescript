import { Logger } from "../services";

export class ListButtonUtils {
  public static getNewPageNumber(
    id: string,
    page: number,
    totalPage: number
  ): { page: number; totalPage: number } {
    let splitted = id.split("_");
    let action = splitted[splitted.length - 1] as "prev" | "next";

    switch (action) {
      case "next":
        return page + 1 >= totalPage
          ? { page: totalPage, totalPage }
          : { page: page + 1, totalPage };
      case "prev":
        return page - 1 <= 1
          ? { page: 1, totalPage }
          : { page: page - 1, totalPage };
    }
  }
}
