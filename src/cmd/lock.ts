import Command, {Permissions} from "../lib/command";
import {Message, TextChannel} from "discord.js";
import {timeout} from "../lib/timeout";

export default Command ({
    names: ["lock"],
    documentation:{
        description: "Locks down a channel.",
        group: "ADMIN",
        usage: "lock"
    },

    check: Permissions.admin,

    fail(message: Message){
        timeout(
            message.member,
            message.member.guild.me,
            "5m",
            "Unauthorized use of `lock` command"
        );
        return message.channel.send("I'm sorry. I'm afraid I can't do that.");
    },

    async exec(message: Message){
        const channel = message.channel as TextChannel;

        //nobody except admins can post in the current channel
        channel.createOverwrite(channel.guild.roles.everyone, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: null,
        });

        return message.channel.send("CHANNEL LOCKED");
    }
});