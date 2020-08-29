import {
    Guild,
    User,
    TextChannel,
    GuildMember,
    Message,
    PartialMessage,
    GuildAuditLogsEntry,
    MessageEmbed
} from "discord.js";
import {makeEmbed} from "../lib/util";
import {client} from "../client";

/**
 * A function to handle a new ban
 * @param guild The guild in which the ban was created
 * @param member The newly-banned member.
 */
async function handleBanAdd(
    guild:Guild,
    user:User
):Promise<Message | boolean>{
    const eventLog = guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return;

    const entry:GuildAuditLogsEntry = await guild
        .fetchAuditLogs({type: "MEMBER_BAN_ADD"})
        .then((logs) => logs.entries.first());
    if(!entry || entry.executor.bot) return;

    let timestamp:Date = new Date();

    const embed:MessageEmbed = makeEmbed()
        .setColor("#C8102E")
        .setTitle("NEW BAN ADDED")
        .setImage(user.avatarURL())
        .addFields(
            {name: "User ID", value: user.id},
            {name: "User Name", value: user.username, inline: true},
            {name: "Discriminator", value: user.discriminator, inline: true},
            {name: "Timestamp", value: timestamp.toLocaleTimeString()},
            {
                name: "Executor",
                value: `${
                    entry.executor.username}#${
                    entry.executor.discriminator}`
            }
        );

    return eventLog.send(embed);
}

/**
 * A function to handle a ban is lifted
 * @param guild The guild in which the ban was lifted
 * @param member The member that had been previously banned
 */
async function handleBanRemove(
    guild:Guild,
    user:User
):Promise<Message | boolean>{
    const eventLog = guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return;

    const entry:GuildAuditLogsEntry = await guild
        .fetchAuditLogs({type: "MEMBER_BAN_REMOVE"})
        .then((logs) => logs.entries.first());
    if(!entry || entry.executor.bot) return;

    let timestamp:Date = new Date();

    const embed:MessageEmbed = makeEmbed()
        .setColor("#00B2A9")
        .setTitle("BAN REMOVED")
        .setImage(user.avatarURL())
        .addFields(
            {name: "User ID", value: user.id},
            {name: "User Name", value: user.username, inline: true},
            {name: "Discriminator", value: user.discriminator, inline: true},
            {name: "Timestamp", value: timestamp.toLocaleTimeString()},
            {
                name: "Executor",
                value: `${
                    entry.executor.username}#${
                    entry.executor.discriminator}`}
        );

    return eventLog.send(embed);
}

/**
 * A function to handle when a member leaves a server
 * @param member The member that just left the server
 */
async function handleLeave(
    member:GuildMember
):Promise<Message | boolean>{

    const eventLog = member.guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return;

    let timestamp:Date = new Date();

    const embed:MessageEmbed = makeEmbed()
        .setColor("#F6EB61")
        .setTitle("MEMBER REMOVAL")
        .setDescription("Member kicked or left server")
        .setImage(member.user.avatarURL())
        .addFields(
            {name: "User ID", value: member.user.id},
            {name: "User Name", value: member.user.username, inline: true},
            {
                name: "Discriminator",
                value: member.user.discriminator,
                inline: true
            },
            {name: "Timestamp", value: timestamp.toLocaleTimeString()},
        );

    return await eventLog.send(embed);
}

/**
 * A function to log when messages are updated or edited
 * @param old an instance of the old message
 * @param current an instance of the new message
 */
async function handleMessageUpdate(
    old:PartialMessage | Message,
    current:PartialMessage | Message
):Promise<Message | boolean>{
    //get old and new attributes and content
    if(old.partial) old = await old.fetch();
    if(current.partial) current = await current.fetch();
    if(old.author.bot) return false;
    if(old.channel.type === "dm") return false;
    if(old.member.hasPermission("ADMINISTRATOR")) return false;

    //find and validate the server log channel
    const serverLog = old.guild?.channels.cache.find(
        (channel) => channel.name === "server-log"
    ) as TextChannel;
    if(!serverLog) return false;

    //send the updated message
    serverLog.send(
        `[${old.author.username}#${
            old.author.discriminator}] in ${
            old.channel.toString()}: ${
            old.content.toString()} => ${
            current.content.toString()}`
    );

    const author:User = old.author;
    const timestamp:Date = new Date();
    const eventLog = old.guild?.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    const embed:MessageEmbed = makeEmbed(old)
        .setColor("#3c1361")
        .setTitle("MESSAGE EDITED")
        .addFields(
            {name: "Username", value: author.username, inline: true},
            {
                name: "Discriminator",
                value: author.discriminator,
                inline: true
            },
            {
                name: "Timestamp",
                value: timestamp.toLocaleTimeString(),
                inline: true
            },
            {name: "In Channel", value: old.channel, inline: true},
            {name: "Old Text:", value: "Text: " + old.content},
            {name: "New Text:", value: "Text: " + current.content},
            {name: "Link", value: current.url}
    );

    eventLog.send(embed);
}

/**
 * A function to log a deleted message
 * @param message an instance of the deleted message
 */
async function handleMessageDelete(message:Message):Promise<boolean>{

    const eventLog = message.guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    const author:GuildMember = message.member;
    const timestamp:Date = new Date();

    if(author.id === client.user.id) return false;
    if(!!author.hasPermission("ADMINISTRATOR")) return false;

    const embed:MessageEmbed = makeEmbed(message)
        .setColor("#034694")
        .setTitle("MESSAGE DELETED")
        .addFields(
            {name: "Username", value: author.user.username, inline: true},
            {
                name: "Discriminator",
                value: author.user.discriminator,
                inline: true
            },
            {
                name: "Timestamp",
                value: timestamp.toLocaleTimeString(),
                inline: true
            },
            {name: "In Channel", value: message.channel},
            {name: "Message Text:", value: "Text: " + message.content},
            {name: "Link (in case of TOS violation)", value: message.url}
    );

    eventLog.send(embed);

    if(message.attachments.array().length > 0){

        eventLog.send("ATTACHMENTS:");

        message.attachments.forEach(attachment => {
            let url:string = attachment.url;
            eventLog.send(url);
        });
    }

    return true;
}

export{
    handleBanAdd,
    handleBanRemove,
    handleLeave,
    handleMessageDelete,
    handleMessageUpdate
};