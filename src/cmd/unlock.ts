import Command, {Permissions} from "../lib/command";
import {Message, TextChannel} from "discord.js";

export default Command ({
    names: ["unlock"],
    documentation:{
        description: "Unlocks a locked channel.",
        group: "ADMIN",
        usage: "unlock"
    },

    check: Permissions.admin,

    fail(message: Message){
        return message.channel.send("I'm sorry. I'm afraid I can't do that.");
    },

    async exec(message: Message){
        const channel = message.channel as TextChannel;

        //reset the perms for the channel
        channel.lockPermissions();

        return message.channel.send("CHANNEL UNLOCKED");
    }
});