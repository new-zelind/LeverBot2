import Command, {Permissions} from "../lib/command";
import {timeoutCounts} from "../lib/timeout";
import {makeEmbed} from "../lib/util";
import {client} from "../client";

export default Command({
    names: ["compliance"],
    documentation: {
        description: "Check to see how many times you've been timed out.",
        group: "META",
        usage: "compliance"
    },

    check: Permissions.all,

    async exec(message){

        //count the number of times the user's id occurs in the timeout file
        let numCitations = timeoutCounts[message.author.id];

        //if the user doesn't exist, then they haven't been timed out.
        if(numCitations == null) numCitations = 0;
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