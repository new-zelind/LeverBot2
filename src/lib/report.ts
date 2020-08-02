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

        return me.send(
            `${error.stack}`
        );
    };
}

export function information(client: Client){
    return async (content: string | MessageOptions): Promise<Message> => {
        const me = await client.users.fetch(owner);
        return me.send(content);
    }
}