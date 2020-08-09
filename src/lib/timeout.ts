import {GuildMember, Role, DMChannel} from "discord.js";
import parse from "parse-duration";
import * as fs from "fs";

/**
 * A function to lift a timeout
 * @param member the member currently on timeout
 */
export const lift = (member: GuildMember) => async () => {
    
    const timeoutRole:Role = member.guild.roles.cache.find(role => role.name === "Timeout");
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
 * The archaic file-writing version of logging a timeout
 * @param member the targeted member
 */
export function logTimeout(member: GuildMember,) {

    //write the member's ID to The File of Shame
    let memberID:string = member.user.id;
    let toLog:string = memberID.concat("\n");
    fs.appendFile('timeouts.txt', toLog, (err) => {
        if(err) console.log(err);
    });
}

/**
 * Places a user in timeout and logs their infraction in The File of Shame
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
    console.log(`${invoker.user.username} timed out ${member.nickname} for ${parse(time)} ms. Reason: ${reason}.`);

    const timeoutRole:Role = member.guild.roles.cache.find(role => role.name === "Timeout");

    //add "timeout" role and log timeout
    await member.roles.add(timeoutRole);
    logTimeout(member);

    //notify the infractor of their timeout.
    const dm:DMChannel = await member.createDM();
    dm.send(
        `You've been timed out by ${invoker.user.username} for ${time} for the following reason: ${reason}. While timed out, you are not permitted to post in any text channel or join any voice channel. If you feel that this was in error, please speak to the admins in _#appeals_.`
    );

    //set timeout
    setTimeout(lift(member), parse(time));
};

//Simple interface for the time out counts structure
interface TOCounts{
    [id: string]: number;
}

//list of all user IDs in The File of Shame
export let timeoutCounts = {};

/**
 * A function to count how many times each user has been placed on timeout.
 */
export function counts(): Promise<TOCounts> {
    return new Promise<TOCounts>((resolve, reject) => {

        //read data in from The File of Shame
        fs.readFile('timeouts.txt', (err, data) => {
            if(err){
                console.log(err);
                reject(err);
            }

            //split the data by newline characters and init counts
            const raw:string[] = data.toString().split("\n");
            const counts:TOCounts = {};

            //count the number of instances
            for(const line of raw){
                if(counts[line]) counts[line]++;
                else counts[line] = 1;
            }

            resolve(counts);
        });
    });
}

/**
 * Populate the timeout counts after a bot startup, or update it
*/
export async function setTimeoutCounts(){
    timeoutCounts = await counts();
}