import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";

export default Command({
    names: ["map"],
    documentation:{
        description: "A link to the interactive campus map.",
        group: "GENERAL",
        usage: "map"
    },

    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message):Promise<Message>{
        return message.channel.send("www.clemson.edu/campus-map");
    }
})