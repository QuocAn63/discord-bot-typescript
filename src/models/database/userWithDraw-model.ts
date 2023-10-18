import { Metadata } from "../metadata-model";

export class UserTicketsData {
  tickets: (UserWithDrawData & { totalPages: number })[];
  metadata: Metadata;

  constructor(
    drawSession: (UserWithDrawData & { totalPages: number })[],
    metadata: Metadata
  ) {
    this.tickets = drawSession;
    this.metadata = metadata;
  }
}

type UserWithDrawData = {
  drawSessionId: string;
  userDiscordId: string;
  number: number;
  buyAtTime: string;
  result?: number;
};

export default UserWithDrawData;
