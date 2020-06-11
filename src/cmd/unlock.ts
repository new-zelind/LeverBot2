import Command, {Permissions} from "../lib/command";
import {Message, TextChannel} from "discord.js";

export default Command ({
    names: ["lock"],

    documentation:{
        description: "Unlocks a locked channel.",
        group: "ADMIN",
        usage: "unlock"
    },

    check: Permissions.admin,

    async exec(message: Message){
        const channel = message.channel as TextChannel;

        channel.lockPermissions();

        return message.channel.send("CHANNEL UNLOCKED");
    }
});