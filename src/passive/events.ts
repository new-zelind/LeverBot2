import {
    Guild,
    User,
    TextChannel,
    GuildMember,
    Message
} from "discord.js";
import {makeEmbed} from "../lib/util";

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

export{
    handleBanAdd,
    handleBanRemove,
    handleLeave
};