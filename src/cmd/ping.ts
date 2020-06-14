import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";

export default Command({
    names: ["ping"],
    documentation:{
        description: "Check the heartbeat of the bot.",
        group: "META",
        usage: "ping"
    },

    check: Permissions.all,

    async exec(message: Message){
        //ping!
        return message.reply("Pong!");
    }
})