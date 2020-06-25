import {GuildMember, Role} from "discord.js";
import parse from "parse-duration";
import * as fs from "fs";

//lift timeout
export const lift = (member: GuildMember) => async () => {
    
    const timeoutRole:Role = member.guild.roles.cache.find(role => role.name === "Timeout");
    //time out complete
    console.log(`Time out for ${member.nickname} complete.`);
    await member.roles.remove(timeoutRole);

    //notify the infractor that their timeout has been lifted
    const dm = await member.createDM();
    dm.send(
        "Your timeout has been lifted, and are permitted to speak again. Remember, multiple violations may lead to longer timeout or a permaban."
    );
};

export function logTimeout(member: GuildMember,) {

    //write the member's ID to The File of Shame
    let memberID: string = member.user.id;
    let toLog = memberID.concat("\n");
    fs.appendFile('timeouts.txt', toLog, (err) => {
        if(err) console.log(err);
    });
}

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
    const dm = await member.createDM();
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

export function counts(): Promise<TOCounts> {
    return new Promise<TOCounts>((resolve, reject) => {

        //read data in from The File of Shame
        fs.readFile('timeouts.txt', (err, data) => {
            if(err){
                console.log(err);
                reject(err);
            }

            //split the data by newline characters and init counts
            const raw = data.toString().split("\n");
            const counts: TOCounts = {};

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
 * @post: updated timeoutCounts data structure
*/
export async function setTimeoutCounts(){
    timeoutCounts = await counts();
}