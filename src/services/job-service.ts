import { Job } from "../jobs";
import schedule from "node-schedule";
import { Logger } from "./logger";

export class JobService {
  constructor(private jobs: Job[]) {}

  public start(): void {
    for (let job of this.jobs) {
      schedule.scheduleJob(job.schedule, async (date) => {
        try {
          if (job.log) {
            Logger.info(`[JOBS-RUNNING]: ${job.name}`);
          }

          await job.run(date);

          if (job.log) {
            Logger.info(`[JOBS-COMPLETED]: ${job.name}`);
          }
        } catch (err) {
          Logger.error(`[JOBS-ERROR]`, err);
        }
      });

      Logger.info(`[JOB_SCHEDULED]: ${job.name}`);
    }
  }
}
