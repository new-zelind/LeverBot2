import {
  Message,
  MessageEmbed,
  PartialMessage
} from "discord.js";

//function to create code blocks
export function code(text: string) {
  return `\`\`\`${text}\`\`\``;
}

//function to create inline code text
export function inline(text: string) {
  return `\`${text}\``;
}

//function to escape out of mentions and references
export function escape(text: string) {
  return (text + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
}

//a function to automatically generate a RichEmbed object
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
