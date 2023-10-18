import { ButtonInteraction, Message } from "discord.js";
import { Button, ButtonDeferType } from "../buttons/button";
import { EventHandler } from "./event-handler";
import { InteractionUtils } from "../utils/interaction-utils";

export class ButtonHandler implements EventHandler {
  constructor(private buttons: Button[]) {}

  public async process(intr: ButtonInteraction, msg: Message): Promise<void> {
    if (intr.user.id === intr.client.user?.id || intr.user.bot) {
      return;
    }

    let button = this.findButton(intr.customId);

    if (!button) return;

    switch (button.deferType) {
      case ButtonDeferType.REPLY: {
        await InteractionUtils.deferReply(intr);
        break;
      }
      case ButtonDeferType.UPDATE: {
        await InteractionUtils.deferUpdate(intr);
        break;
      }
    }

    if (button.deferType !== ButtonDeferType.NONE && !intr.deferred) {
      return;
    }

    await button.execute(intr, msg);
  }

  private findButton(id: string): Button | undefined {
    return this.buttons.find((button) => button.ids.includes(id));
  }
}
