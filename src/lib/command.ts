import {
  Message as FullMessage,
  TextChannel,
  PartialMessage,
  MessageEmbed,
} from "discord.js";
import {authorization} from "./access";
import {client} from "../client";

const owner:string = authorization("discord.owner");
export const PREFIX:string = authorization("discord.prefix");

type Message = FullMessage | PartialMessage;

/**
 * A function to identify if a message is a command
 * @param message: the string to find a command in
 * @returns: true of #message includes PREFIX
 *           false if #message does not
 */
export function isCommand(message: Message) {
  if (!message.content) return false;
  return PREFIX.includes(message.content[0]);
}

/**
 * @defines names:          The name and any aliases of the command
 *          documentation:  Documentation about the command for $help command
 *            description:  What the command does
 *            usage:        How to invoke the command, and syntax
 *            group:        Which group the command falls under
 *                            (META, ADMIN, DEV, GENERAL)
 *            hidden:       Whether or not the command is hidden
 * 
 * @initialization ensures that names, description, usage, group, are empty strings
 */
export interface CommandConfiguration {
  names: string[];

  documentation: {
    description: string;
    usage: string;
    group: string;
    hidden?: boolean;
  };

  // Lifecycle methods

  // See if it's valid to use the command (see the Permissions object below)
  check: (message: Message) => boolean | Promise<boolean>;

  // If the check fails
  fail?: (message: Message) => void;

  // Execute the command
  exec(
    message: Message,
    args: string[]
  ): Promise<Message | Message[] | void> | void;
}

// Holds all the registered commands (with each name being mapped)
export const REGISTRY = new Map<string, CommandConfiguration>();

/**
 * A function to match a command invocation to its location in the registry
 * @param message : the command to match
 * @returns null if the registry does not contain the command
 *          the name of the command if it exists in the registry
 */
export function matchCommand(message: Message) {
  const name:string = message.content?.slice(1).split(" ")[0] || "";

  if (!REGISTRY.has(name)) {
    return null;
  }

  return REGISTRY.get(name);
}

/**
 * A function to initialize the list of commands
 * @param config : An instance of a command
 * @return : #config
 */
export default function makeCommand(config: CommandConfiguration) {
  for (const name of config.names) {
    REGISTRY.set(name, config);
  }

  return config;
}

// Handles all of the commands we've already executed
export const RESPONSES = new Map<Message, Message>();

// Commands that are disabled go here
export const DISABLED = new Set<CommandConfiguration>();

/**
 * A command to handle all messages sent in the server
 * @param message : The message just sent by a GuildMember
 * @returns :
 *    false if the message is not a command
 *    false if the bot sent the command
 *    false if the message is empty
 *    false if matchCommand(#message) returns null
 *    false if the command is disabled
 *    true if the #message.author does not have permission to invoke the command
 *    true if the command is successfully executed
 */
export async function handle(message: Message): Promise<boolean> {

  if (!isCommand(message)) return false;
  if (message.author?.id == client.user.id) return false;
  if (!message.content) return false;

  // Get the appropriate command, if it exists
  const command:CommandConfiguration = matchCommand(message);
  if (!command) {
    message.channel.send(
      `No such command \`${message.content?.slice(1).split(" ")[0]}\`. Use \`${
        PREFIX[0]
      }help\` for a list of commands.`
    );
    return false;
  }

  // Check if the command is disabled
  const disabled:boolean = DISABLED.has(command);
  if (disabled && !Permissions.owner(message)) {
    return false;
  }

  // See if the command is allowed to be used by the permission system
  const allowed:boolean = await command.check(message);
  if (!allowed && command.fail) {
    command.fail(message);

    return true;
  }

  // Get the arguments
  const argstring:string = message.content.split(" ").slice(1).join(" ");
  let argv = argstring.match(/“([^“”]+)”|"([^"]+)"|'([^']+)'|([^\s]+)/g);

  // Get the arguments
  //const argv = message.content.split(" ").slice(1);

  // Start the timer (for when we edit the message later to indicate how long the command takes)
  const start:number = Date.now();
  const response:(
    void | Message | PartialMessage | Message[]
  ) = await command.exec(message, argv);

  // If the command gave us a response to track
  if (response) {
    const main:Message = response instanceof Array ? response[0] : response;

    // Archive that resposne
    RESPONSES.set(message, main);

    // If there isn't any attached embeds, then edit the message itself
    if (!main.embeds || main.embeds.length < 1) {
      main.edit(
        main.content +
          ` *(took ${Date.now() - start}ms${
            process.env["DEV"] ? " — DEV MODE" : ""
          })*`
      );

      // Otherwise get the last embed and edit it;
    } else {
      const embed:MessageEmbed = main.embeds[0];

      embed.setFooter(
        embed.footer?.text +
          ` *(took ${Date.now() - start}ms${
            process.env["DEV"] ? " — DEV MODE" : ""
          })*`
      );

      main.edit({ embed });
    }
  }

  return true;
}


/**
 * A constant to check for certain permissions. This will tell the bot when,
 * where, and by whom a command may be executed.
 */
export const Permissions = {

  //Server administrators only
  admin(message: Message) {
    return (
      message.channel.type === "text" &&
      !!message.member?.hasPermission("ADMINISTRATOR")
    );
  },

  //For the bot's owner only, typically for dev commands
  owner(message: Message) {
    return message.author?.id === owner;
  },

  //Only allowed within a text channel within a server
  guild(message: Message) {
    return message.channel.type == "text";
  },

  //Only allowed within a DM
  dm(message: Message) {
    return message.channel.type === "dm";
  },

  //Only allowed within a certain channel
  channel(name: string) {
    return (message: Message) => (message.channel as TextChannel).name === name;
  },

  role(name: string){
    return (message: Message) => message.member.roles.highest.name === name;
  },

  //No restrictions
  all() {
    return true;
  },

  //Create a set of permissions. Returns true if all permissions return true.
  compose(...checks: ((message: Message) => boolean)[]) {
    return (message: Message) =>
      checks.map((check) => check(message)).every((resp) => resp);
  },

  //Create a set of permissions. Returns true if any permission passed in
  //returns true.
  any(...checks: ((message: Message) => boolean)[]) {
    return (message: Message) =>
      checks.map((check) => check(message)).some((resp) => resp);
  },
};