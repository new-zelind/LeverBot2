import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";

export default Command({
    names: ["map"],
    documentation:{
        description: "A link to the interactive campus map.",
        group: "GENERAL",
        usage: "map"
    },

    check: Permissions.channel("bot-commands"),

    async fail(message:Message){
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message){
        //interactive campus map
        message.channel.send("www.clemson.edu/campus-map");
    }
})