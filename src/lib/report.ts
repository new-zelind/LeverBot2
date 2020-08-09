import {
    Client,
    Message,
    User
} from "discord.js";
import {authorization} from "../lib/access";

//Me
const owner:string = authorization("discord.owner");

/**
 * A function to report errors and unhandled exceptions in your DMs
 * @param client an instance of the bot
 */
export default function report(client: Client){
    return async(error: Error): Promise<Message> => {

        //Me
        const me:User = await client.users.fetch(owner);

        //red alert
        client.user.setPresence({
            activity: {name: "with errors"},
            status: "dnd"
        });

        //send me the errors
        return me.send(
            `${error.stack}`
        );
    };
}