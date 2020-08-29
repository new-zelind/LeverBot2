import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";
import * as keya from "keya";
import { timeout } from "../lib/timeout";

export default Command({
    names:["wofclear"],
    documentation:{
        description: "Clears the Wall of Fame map cache",
        group: "DEV",
        usage: "wofclear"
    },

    check: Permissions.owner,

    async fail(message:Message):Promise<Message>{
        timeout(
            message.member,
            message.member.guild.me,
            "5m",
            "Unauthorized use of `wofclear` command"
        );
        return message.channel.send("I'm sorry, I'm afraid I can't do that.");
    },

    async exec(message:Message):Promise<Message>{
        const store = await keya.store<any>('wof');
        store.clear();

        return message.channel.send("Store cleared.");
    }
});