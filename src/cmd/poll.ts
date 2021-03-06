import {
  Message,
  MessageReaction,
  MessageEmbed,
  PartialMessage,
  ReactionCollector,
  User,
  Collection,
} from "discord.js";
import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";
import {client} from "../client";
import parse from "parse-duration";

// Reactions
const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export default Command({
  names: ["poll"],

  documentation: {
    description: "Start a poll with up to ten options.",
    group: "GENERAL",
    usage: `poll <time> <"Question"> "<Option 1>" "<Option 2>" ... "Option n">`,
  },

  check: Permissions.all,

  async exec(
    message:Message,
    [duration, question, ...options]
  ):Promise<void | Message | Message[] | PartialMessage>{
    if (!message.member) return;
    if (options.length > 10) {
      return message.channel.send("10 options maximum, please.");
    }

    // Poll duration
    const time:number = parse(duration);
    const ends:Date = new Date(Date.now() + time);

    const invoker:string = message.member.nickname || message.author.username;

    const embed:MessageEmbed = makeEmbed(message)
      .setAuthor(invoker, message.author.avatarURL() ?? undefined)
      .setTitle(`Poll: ${question}`);

    let description:string = `Voting ends at: ${ends.toLocaleString()}. \n`;

    for (const [i, option] of Object.entries(options)) {
      description += `${emoji[+i]} — ${option}\n\n`;
    }

    embed.setDescription(description);

    // Post the embed
    const poll:Message = (await message.channel.send({ embed }));

    // React with all of the appropriate emoji
    for (let i = 0; i < options.length; i++) {
      await poll.react(emoji[i]);
    }

    // Custom listener
    const collector:ReactionCollector = poll.createReactionCollector(
      (reaction: MessageReaction) =>
        emoji.includes(reaction.emoji.toString()),
      { time }
    );

    collector.on("collect", async (reaction) => {

      const voter:User = reaction.users.cache.last();
      const votes:Collection<string, MessageReaction> = collector.collected;

      if(!voter) return;
      if(voter === client.user) return;

      // Get all their other votes and delete them
      const otherVotes:Collection<string, MessageReaction> = votes.filter(
        (choice) =>
          choice.users.cache.has(voter.id) && choice.emoji !== reaction.emoji
      );

      // Remove all their other votes
      for (const choice of otherVotes.values()) {
        choice.users.remove(voter);
      }
    });

    collector.on("end", (collected) => {
      const embed:MessageEmbed = poll.embeds[0];
      poll.reactions.removeAll();

      description += "**The winner is...**\n";

      let winner:MessageReaction = collected.first() as MessageReaction;
      for (const reaction of collected.values()) {
        if (reaction.partial) continue;
        if ((reaction.count as number) > (winner.count as number)) {
          winner = reaction;
        }
      }

      const opt:string = options[emoji.indexOf(winner.emoji.toString())];
      description += opt;

      const replacement:MessageEmbed = new MessageEmbed(embed);
      replacement.setDescription(description);

      poll.edit({embed: replacement});
    });

    return poll;
  }
});