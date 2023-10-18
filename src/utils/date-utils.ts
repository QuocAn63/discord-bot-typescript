import moment, { DurationInputArg2, Moment } from "moment";

export class DateUtils {
  private time: Moment;

  constructor(input?: string) {
    if (!input) this.time = moment();
    else this.time = moment(input, "YYYY-MM-DD hh:mm:ss");

    return this;
  }

  public add(amount: number, unit: DurationInputArg2) {
    this.time.add(amount, unit);
    return this;
  }

  public toString(): string {
    return this.time.format("LLL");
  }
}
