import Command, {
  Permissions,
  REGISTRY,
  PREFIX,
  CommandConfiguration,
} from "../lib/command";
import { Message } from "discord.js";

export const HelpCommand = Command({
  names: ["help"],
  documentation: {
    description: "Well, you found this, didn\'t you?",
    usage: "help",
    group: "META",
  },

  check: Permissions.all,
  
  async exec(message: Message) {
    //organize the commands into their respective group
    const groups: {
      [group: string]: CommandConfiguration[];
    } = {};

    //for each command
    for (const [name, command] of REGISTRY) {
      
      //get rid of all aliases
      if (name !== command.names[0]) continue;

      //and place it into its group
      const group = command.documentation.group.toUpperCase();

      //if the group exists already, push the command into the group
      //otherwise, make a new group
      if (groups[group]) groups[group].push(command);
      else groups[group] = [command];
    }

    //start building the help message
    let body = "Here's a list of all my commands:\n";

    //for each group, list the name of the group
    for (const [name, commands] of Object.entries(groups)) {
      body += `\n__**${name}**__:\n`;

      //list the name, purpose, and syntax for each command in the group
      for (const command of commands) {
        body += command.names.map((n) => `*${n}*`).join(" or ");
        body += ": " + command.documentation.description + " ";
        body += `\n\tSyntax: \`${PREFIX[0]}${command.documentation.usage}\`\n`;
      }
    }

    //friendly reminder
    body += "\nPlease keep bot usage in _#bot-commands_!";

    //if the body is over 1900 characters, split it into groups of 1900 or less
    async function postMessage(chunk: string) {
      if (chunk.length > 1900) {
        for (let i = 0; i < chunk.length; i += 1900) {
          const subchunk = chunk.slice(i, i + 1900);
          await postMessage(subchunk);
        }
      }
      else return message.channel.send(chunk);
    }

    //send it
    return postMessage(body);
  },
});