import {
  Message,
  MessageEmbed,
  PartialMessage
} from "discord.js";

/**
 * A function to create a block of code with no explicit language declaration.
 * @param text The text to place in the code block
 */
export function code(text: string):string {
  return `\`\`\`${text}\`\`\``;
}

/**
 * A function to create inline code
 * @param text The text to place in the inline code block
 */
export function inline(text: string) {
  return `\`${text}\``;
}

/**
 * A function to escape out of role and user @ mentions
 * @param text The text to remove @ mentions from
 */
export function escape(text: string) {
  return (text + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
}

/**
 * A function to automatically generate a RichEmbed object, cuz those things
 * are just fucking annoying
 * @param message the message to be used as a reference, typically from the
 *                channel the embed will be send in
 * @return a new RichEmbed object with timestamp and a footer containing the
 *         invoker
 */
export function makeEmbed(message?: Message | PartialMessage) {
  const embed = new MessageEmbed().setTimestamp();

  if (message) {
    const invoker =
      message.channel.type === "text"
        ? message.member.displayName
        : message.author.username;
    embed.setFooter(`Invoked by ${invoker}`);
  }

  return embed;
}
