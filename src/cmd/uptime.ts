import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js"
import {client} from "../client";

export default Command({
    names: ["uptime"],
    documentation: {
        description: "Check how long the bot has been running.",
        group: "META",
        usage: "uptime"
    },

    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message: Message):Promise<Message>{
        if(!client.uptime || !client.user) return;

        //ms to days, hours, minutes, seconds
        let uptime:number = client.uptime / 1000;
        let d:number = Math.floor(uptime / 86400);
        let h:number = Math.floor(uptime / 3600);
        uptime %= 3600;
        let m:number = Math.floor(uptime / 60);
        let s:number = uptime % 60;

        return message.channel.send(
            `**${client.user.tag} UPTIME**\n_${d}_ DAYS, _${h}_ HOURS, _${m}_ MINUTES, _${s.toFixed(3)}_ SECONDS`
        );
    }
});