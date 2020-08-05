import {
    Client,
    Message,
    MessageOptions
} from "discord.js";
import {authorization} from "../lib/access";

const owner:string = authorization("discord.owner");

export default function report(client: Client){
    return async(error: Error): Promise<Message> => {
        const me = await client.users.fetch(owner);

        client.user.setPresence({
            activity: {name: "with errors"},
            status: "dnd"
        });

        return me.send(
            `${error.stack}`
        );
    };
}