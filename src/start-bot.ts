import { CustomClient } from "./extensions/custom-client";
import {
  DailyNotificationService,
  JobService,
  Logger,
  CommandRegistraion,
} from "./services";
import config from "../config/config.json";
import { GatewayIntentsString, REST } from "discord.js";
import { Command } from "./command";
import { Bot } from "./models/bot";
import { HelloTrigger, Trigger } from "./triggers";
import {
  BanVeSoCommand,
  KetQuaXoSoCommand,
  LichSuXoSoCommand,
  MuaVeSoCommand,
  TroGiupCommand,
  VeCuaToiCommand,
} from "./command/veso";
import { LichSuButton, VeCuaToiButton, Button } from "./buttons";
import {
  ButtonHandler,
  CommandHandler,
  GuildJoinHandler,
  GuildLeaveHandler,
  MessageHandler,
  TriggerHandler,
} from "./events";
import {
  CreateNewDrawSessionJob,
  DailyResultNotificationJob,
  Job,
} from "./jobs";
import { DatabaseConnector } from "./services/database";
import { DrawRepo, GuildRepo, UserRepo } from "./services/database/repo";
import moment from "moment";
import fs from "fs";

async function start(): Promise<void> {
  moment.locale("vi");

  Logger.info("Starting Bot!");

  let db = new DatabaseConnector({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT
      ? Number.parseInt(process.env.POSTGRES_PORT)
      : 5432,
    password: process.env.POSTGRES_PASSWORD_FILE
      ? fs.readFileSync(process.env.POSTGRES_PASSWORD_FILE, "utf8")
      : process.env.POSTGRES_PASSWORD,
  });
  let client = new CustomClient({
    intents: config.client.intents as GatewayIntentsString[],
    partials: config.client.partials as any,
  });

  let guildRepo = new GuildRepo(db);
  let drawRepo = new DrawRepo(db);
  let userRepo = new UserRepo(db);

  let commands: Command[] = [
    new MuaVeSoCommand(drawRepo, guildRepo, userRepo),
    new KetQuaXoSoCommand(drawRepo),
    new LichSuXoSoCommand(drawRepo),
    new VeCuaToiCommand(drawRepo),
    new BanVeSoCommand(guildRepo, drawRepo),
    new TroGiupCommand(),
  ];
  let buttons: Button[] = [
    new LichSuButton(drawRepo),
    new VeCuaToiButton(drawRepo),
  ];
  let triggers: Trigger[] = [new HelloTrigger()];
  let jobs: Job[] = [
    new DailyResultNotificationJob(
      client,
      guildRepo,
      drawRepo,
      new DailyNotificationService()
    ),
    new CreateNewDrawSessionJob(client, guildRepo, drawRepo),
  ];

  let guildJoinHandler = new GuildJoinHandler();
  let guildLeaveHandler = new GuildLeaveHandler();
  let commandHandler = new CommandHandler(commands);
  let triggerHandler = new TriggerHandler(triggers);
  let messageHandler = new MessageHandler(triggerHandler);
  let buttonHandler = new ButtonHandler(buttons);

  let botToken = process.env.B0T_TOKEN;
  let botClientId = process.env.BOT_CLIENT_ID;

  if (!botToken) {
    Logger.error("[BOT]: No token provided.");
    return;
  }

  if (!botClientId) {
    Logger.error("[BOT]: No Bot Client ID provided.");
    return;
  }

  let bot = new Bot(
    botToken,
    client,
    guildJoinHandler,
    guildLeaveHandler,
    commandHandler,
    messageHandler,
    buttonHandler,
    new JobService(jobs)
  );

  // Registerin commands

  let commandArgv = process.argv[2];

  if (commandArgv) {
    try {
      let rest = new REST().setToken(botToken);
      let localCmds = commands.map((command) => command.metadata);

      switch (commandArgv) {
        case "command:register":
          await new CommandRegistraion(botClientId, rest).process(
            localCmds,
            "register"
          );
          break;
        case "command:delete":
          await new CommandRegistraion(botClientId, rest).process(
            localCmds,
            "delete"
          );
          break;
      }
    } catch (err) {
      Logger.error(`[COMMAND_REGISTRATION]: ERROR OCCURED`, err);
    }
  }
  await bot.start().catch((err) => Logger.error(err));
}

start();
