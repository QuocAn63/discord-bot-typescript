import { RecurrenceRule } from "node-schedule";
import { JobCallback } from "node-schedule";
export default interface Job {
  name: string;
  log: boolean;
  schedule: string | RecurrenceRule;
  run(fireDate?: Date): Promise<void>;
}
