import {GuildMember, Role, DMChannel, Guild, Message, TextChannel, MessageEmbed} from "discord.js";
import parse from "parse-duration";
import * as keya from "keya";
import { makeEmbed } from "./util";

export interface TimeoutCount{
    total:number;
}

/**
 * A function to send the #event-log message for the timeout
 * @param member the targeted member
 * @param invoker the admin/mod who performed the timeout
 * @param time the duration of the timeout
 * @param reason the specified reason for the timeoutn 
 */
export async function sendLogEmbed(
    member: GuildMember,
    invoker: GuildMember,
    time: string,
    reason: string
):Promise<Message>{
    const eventLog = member.guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return;

    const embed:MessageEmbed = makeEmbed()
        .setColor("EFDBB2")
        .setTitle("TIMEOUT ASSIGNED")
        .setImage(member.user.avatarURL())
        .addFields(
            {name: "Username:", value: member.toString()},
            {name: "Invoker:", value: invoker.toString()},
            {name: "For Reason:", value: reason},
            {name: "Sentence:", value: time}
        );

    return eventLog.send(embed);
}

/**
 * A function to lift a timeout
 * @param member the member currently on timeout
 */
export const lift = (member: GuildMember) => async () => {
    
    const timeoutRole:Role = member.guild.roles.cache.find(role => role.name === "Timeout");
    if(!timeoutRole) return;

    //time out complete
    console.log(`Time out for ${member.nickname} complete.`);
    await member.roles.remove(timeoutRole);

    //notify the infractor that their timeout has been lifted
    const dm:DMChannel = await member.createDM();
    dm.send(
        "Your timeout has been lifted, and are permitted to speak again. Remember, multiple violations may lead to longer timeout or a permaban."
    );
};

/**
 * A function to add the timeout to the keya database
 * @param member the member placed in timeout
 */
async function addTimeout(member:GuildMember):Promise<void>{
    
    //load keya database and get current record
    const store = await keya.store<TimeoutCount>('timeouts');
    let record:TimeoutCount = await store.get(member.user.id);

    //if the record doesn't exist, make a new one
    if(!record){
        await store.set(member.user.id, {total: 0});
        record = await store.get(member.user.id);
    }

    //incrememnt timeout count and set the new record.
    record.total++;
    await store.set(member.user.id, record);
    return;
}

/**
 * A function to make the message that sent to each member placed in timeout.
 * @param invoker the admin/mod who performed the timeout
 * @param time the duration of the timeout
 * @param reason the specified reason for the timeout 
 */
async function makeTimeoutMessage(
    invoker:GuildMember,
    time:string,
    reason:string
):Promise<string>{
    let timeoutMsg:string = `You've been timed out by ${invoker.user.username}`;
    timeoutMsg += ` for ${time} for the following reason: ${reason}.`;
    timeoutMsg += `While timed out, you are not permitted to post in any text`;
    timeoutMsg += `channel or join any voice channel. If you feel that this was`
    timeoutMsg += `in error, please speak to the admins in _#appeals_.`
    return timeoutMsg;
}

/**
 * Places a user in timeout and logs their infraction
 * @param member the targeted member
 * @param invoker the admin/mod who performed the timeout
 * @param time the duration of the timeout
 * @param reason the specified reason for the timeout
 */
export async function timeout(
    member: GuildMember,
    invoker: GuildMember,
    time: string,
    reason: string
) {
    //log timeout
    addTimeout(member);

    //find timeout role
    const timeoutRole:Role = member.guild.roles.cache.find(role =>
        role.name === "Timeout"
    );
    if(!timeoutRole) return;

    //add "timeout" role and log timeout
    await member.roles.add(timeoutRole);

    //notify the infractor of their timeout.
    const dm:DMChannel = await member.createDM();
    dm.send(`${await makeTimeoutMessage(invoker, time, reason)}`);

    //set timeout
    setTimeout(lift(member), parse(time));
};