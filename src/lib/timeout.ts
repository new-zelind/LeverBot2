import {GuildMember} from "discord.js";
import parse from "parse-duration";
import * as fs from "fs";

//timeout role
export const timeoutRole = "576734464562954243";

//lift timeout
export const lift = (member: GuildMember) => async () => {
    
    //time out complete
    console.log(`Time out for ${member} complete.`);
    await member.roles.remove(timeoutRole);

    //notify the infractor that their timeout has been lifted
    const dm = await member.createDM();
    dm.send(
        "Your timeout has been lifted, and are permitted to speak again. Remember, multiple violations may lead to longer timeout or a permaban."
    );
};

export async function timeout(
    member: GuildMember,
    invoker: GuildMember | null,
    time: string,
    reason: string
) {
    console.log(`${invoker} timed out ${member} for ${parse(time)} ms. Reason: ${reason}.`);

    //add "timeout" role
    await member.roles.add(timeoutRole);

    //notify the infractor of their probation.
    const dm = await member.createDM();
    dm.send(
        `You've been placed on probation by ${invoker} for ${time} for the following reason: ${reason}. While on probation, you are not permitted to post in any text channel or join any voice channel. If you feel that this was in error, please speak to the admins in _#appeals_.`
    );
};

export function logTimeout(member: GuildMember,) {

    //write the member's ID to The File of Shame
    let memberID: string = member.user.id;
    let toLog = memberID.concat("\n");
    fs.writeFile("../../timeouts.txt", toLog, (err) => {
        if(err) console.log(err);
    });
}

//Simple interface for the time out counts structure
interface TOCounts{
    [id: string]: number;
}

//list of all user IDs in The File of Shame
export let timeoutCounts = {};

export function counts(): Promise<TOCounts> {
    return new Promise<TOCounts>((resolve, reject) => {

        //read data in from The File of Shame
        fs.readFile("../../timeouts.txt", (err, data) => {
            if(err) reject(err);

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