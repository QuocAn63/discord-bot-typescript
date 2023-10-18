import { ActivityType, Client, ClientOptions, Presence } from "discord.js";

export class CustomClient extends Client {
    constructor(clientOptions: ClientOptions){
        super(clientOptions)
    }

    public setPresence(type: ActivityType, name: string, url: string): Presence | undefined{
        return this.user?.setPresence({
            activities: [
                {
                    type: type,
                    name,
                    url
                }
            ]
        })
    }

}