import Command, {Permissions} from "../lib/command";
import { Message } from "discord.js";

export default Command({
    names: ["source"],
    documentation: {
        description: "See ByrnesBot's source code on GitHub.",
        group: "META",
        usage: "source"
    },

    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message: Message):Promise<Message>{
        let msg:string = "**Here's my source code:**\nhttps://github.com/new-zelind/LeverBot2";
        if(Math.random() >= 0.95) msg += "\n_Be sure to give it a star!_";

        return message.channel.send(msg);
    }
});