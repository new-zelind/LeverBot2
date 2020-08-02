import {
    Guild,
    User,
    TextChannel,
    GuildMember,
    Message,
    PartialMessage
} from "discord.js";
import {makeEmbed} from "../lib/util";
import {client} from "../client";

/**
 * A function to handle a new ban
 * @pre guild.bans = #guild.bans + 1
 *      member.banned == (false -> true)
 * @param guild The guild in which the ban was created
 * @param member The newly-banned member.
 * @post Sends a message in #event-log containing the specifics
 *       of the ban
 */
async function handleBanAdd(
    guild:Guild,
    user:User
):Promise<void>{
    const eventLog = guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return;

    const entry = await guild
        .fetchAuditLogs({type: "MEMBER_BAN_ADD"})
        .then((logs) => logs.entries.first());
    if(!entry || entry.executor.bot) return;

    let timestamp = new Date();

    const embed = makeEmbed()
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

    await eventLog.send(embed);
    return;
}

/**
 * A function to handle a ban is lifted
 * @pre guild.bans = #guild.bans - 1
 *      member.banned == (true -> false)
 * @param guild The guild in which the ban was lifted
 * @param member The member that had been previously banned
 * @post Sends a message in #event-log containing the specifics
 *       of the ban lift
 */
async function handleBanRemove(
    guild:Guild,
    user:User
):Promise<void>{
    const eventLog = guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return;

    const entry = await guild
        .fetchAuditLogs({type: "MEMBER_BAN_REMOVE"})
        .then((logs) => logs.entries.first());
    if(!entry || entry.executor.bot) return;

    let timestamp = new Date();

    const embed = makeEmbed()
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

    await eventLog.send(embed);
    return;
}

/**
 * A function to handle when a member leaves a server
 * @pre guild.members = #guild.members - 1
 * @param member The member that just left the server
 * @post Sends a message in #event-log containing the specifics
 *       of the kick, or voluntary exit
 */
async function handleLeave(
    member:GuildMember
):Promise<void>{

    const eventLog = member.guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return;

    let timestamp = new Date();

    const embed = makeEmbed()
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

    await eventLog.send(embed);
    return;
}

//a way to log when messages are updated or edited
async function handleMessageUpdate(
    old:PartialMessage | Message,
    current:PartialMessage | Message
){
    //get old and new attributes and content
    if(old.partial) old = await old.fetch();
    if(current.partial) current = await current.fetch();
    if(old.author.bot) return true;
    if(old.channel.type === "dm") return false;

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
}

function handleMessageDelete(message:Message){

    const eventLog = message.guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    const author:User = message.author;
    const timestamp = new Date();

    if(author.id === client.user.id) return;

    const embed = makeEmbed(message)
        .setColor("#034694")
        .setTitle("MESSAGE DELETED")
        .addFields(
            {name: "Username", value: author.username, inline: true},
            {
                name: "Discriminator",
                value: author.discriminator,
                inline: true
            },
            {name: "Timestamp", value: timestamp.toLocaleTimeString()},
            {name: "In Channel", value: message.channel},
            {name: "Message Text:", value: "Text: " + message.content},
            {name: "Link", value: message.url}
        );

    eventLog.send(embed);

    if(message.attachments.array().length > 0){

        eventLog.send("ATTACHMENTS:");

        message.attachments.forEach(attachment => {
            let url:string = attachment.url;
            eventLog.send(url);
        });
    }
}

export{
    handleBanAdd,
    handleBanRemove,
    handleLeave,
    handleMessageDelete,
    handleMessageUpdate
};