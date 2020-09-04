import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";
import {client} from "../client";
import {Message} from "discord.js";
import * as keya from "keya";
import {TimeoutCount} from "../lib/timeout";

export default Command({
    names: ["compliance"],
    documentation: {
        description: "Check to see how many times you've been timed out.",
        group: "META",
        usage: "compliance"
    },

    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message:Message):Promise<Message>{

        const store = await keya.store<TimeoutCount>('timeouts');
        let numCitations:number;

        //count the number of times the user's id occurs in the timeout file
        let entry:TimeoutCount = await store.get(message.author.id);

        //if the user doesn't exist, then they haven't been timed out.
        if(!entry) numCitations = 0;
        else numCitations = entry.total;

        //make the embed with data
        const embed = makeEmbed(message)
            .setColor("#B91A1A")
            .setTitle(`COMPLIANCE CHECK`)
            .setThumbnail(client.user.displayAvatarURL());

        let description = `Greetings, ${message.author.username}#${message.author.discriminator}.`;
        description += `\nYou have recieved **${numCitations}** citations.`;
        description += `\nMaintain your compliance.\n_Glory to Byrnes/Lever._`

        embed.setDescription(description);

        return message.channel.send(embed);
    }
});