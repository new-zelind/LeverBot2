import {GuildMember, Guild, Message, PartialMessage} from "discord.js";
import parse from "parse-duration";

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

export default async function timeout(
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