import {Message, MessageReaction, MessageEmbed, Guild} from "discord.js";
import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";
import parse from "parse-duration";

const emoji = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

export default Command({
    names:["poll", "vote"],
    documentation:{
        description: "Start a poll!",
        usage: "poll \"<Question>\" [<Option 1>, \"<Option 2>\", ... <Option _n_>]",
        group: "GENERAL"
    },

    check: Permissions.guild,
    fail(message: Message){
        return message.reply("I can't do a poll in a DM.");
    },
    async exec(message: Message, [duration, question, ...options]){
        if(!message.member) return;
        if(options.length > 10){
            return message.channel.send("Cannot have more than 10 options.");
        }

        const time = parse(duration);
        const ends = new Date(Date.now() + time);
        
        const invoker = message.member.nickname || message.author.username;

        const embed = makeEmbed(message)
            .setAuthor(invoker, message.author.avatarURL() ?? undefined)
            .setTitle(`Poll: ${question}`);
        
        let description = `Poll ends at ${ends.toLocaleString()}.\n*${invoker} can end the poll early by reacting with ✅.*\n\n`;

        for(const [i, option] of Object.entries(options)){
            description += `${emoji[+i]}: ${option}\n\n`;
        }

        embed.setDescription(description);

        const poll = (await message.channel.send({embed})) as Message;

        for(let i=0; i < options.length; i++) await poll.react(emoji[i]);
        await poll.react("✅");

        const collector = poll.createReactionCollector(
            (reaction: MessageReaction) =>
                emoji.includes(reaction.emoji.toString()) ||
                reaction.emoji.toString() === "✅",
            {time}
        );

        collector.on("collect", async(reaction, user) => {
            if(
                reaction.emoji.toString() === "✅" &&
                (user.id === message.author.id ||
                    (reaction.message.guild as Guild)
                        .member(user)
                        ?.hasPermission("ADMINISTRATOR"))
            ){
                collector.emit("end");
            }

            const voter = reaction.users.cache.last();
            const votes = collector.collected;

            if(!voter) return;

            const otherVotes = votes.filter(
                (choice) =>
                    choice.users.cache.has(voter.id) &&
                    choice.emoji !== reaction.emoji
            );

            for(const choice of otherVotes.values()) choice.users.remove(voter);
        });

        collector.on("end", (collected) => {
            const embed = poll.embeds[0];

            description += "**Time's Up!** \nThe winner of the poll is...\n";

            let winner: MessageReaction = collected.first() as MessageReaction;
            for (const reaction of collected.values()) {
                if (reaction.partial) continue;
                if ((reaction.count as number) > (winner.count as number)) {
                    winner = reaction;
                }
            }

            const opt = options[emoji.indexOf(winner.emoji.toString())];
            description += opt;

            const replacement = new MessageEmbed(embed);
            replacement.setDescription(description);

            poll.edit({ embed: replacement });
        });

        return poll;
    }
});