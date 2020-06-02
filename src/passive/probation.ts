import * as Keya from "keya";
import {client} from "../client";
import {GuildMember, Guild} from "discord.js";

import parse from "parse-duration";
import report from "../lib/report";
import { Recoverable } from "repl";
import { clearTimeout } from "timers";

export let TIMEOUTS: {[key: string]: NodeJS.Timeout} = {};

interface Probation {
    start: number;
    end: number;
    reason: string;
    guild: string;
}

export async function initialize(){

    //list of all active probations
    const store = await Keya.store<Probation>("probations");

    //get list of in-progress probations at bot shutdown or restart
    const probations = await store.all();
    console.log(`Restoring ${probations.length} probations...`);

    //resume any interrupted probations.
    for(let probation of probations){
        const {end, guild} = probation.value;
        TIMEOUTS[`${guild}:${probation.key}`] = setTimeout(
            free(probation.key, guild),
            end - Date.now()
        );
    }
}

export const free = (memberid: string, guildid: string) => async () => {
    const guild = client.guilds.resolve(guildid) as Guild;
    const member = guild.members.resolve(memberid) as GuildMember;

    //get the proper role and check to see if this was done properly
    const probation = member.guild.roles.cache.find(
        (role) => role.name.toLowerCase() === "probation"
    );

    if(!probation){
        report(client)(
            new Error(`Error: Could not find appropriate role during free.`)
        );
        return;
    }

    //Probation is over
    console.log(`Freeing ${member}`);
    const store = await Keya.store<Probation>("probations");
    await member.roles.remove(probation);

    //notify the infractor that their probation has been lifted
    const dm = await member.createDM();
    dm.send(
        "Your probation has been lifted, and are permitted to speak again. Remember, multiple violations may lead to longer probations or a permaban."
    );

    //remove the member from the probate map
    store.delete(member.id);

    clearTimeout(TIMEOUTS[`${guild.id}:${member.id}`]);
    delete TIMEOUTS[`${guild.id}:${member.id}`];
};

export default async function probate(
    member: GuildMember,
    by: GuildMember | null,
    time: string,
    reason: string
) {
    console.log(`Probated ${member} by ${by} for ${parse(time)} ms. Reason: ${reason}.`);

    const store = await Keya.store<Probation>("probations");
    const end = Date.now() + parse(time);

    //store the user and probate info in keya
    await store.set(member.id, {
        start: Date.now(),
        end,
        reason,
        guild: member.guild.id,
    });

    //set timeout
    TIMEOUTS[`${member.guild.id}:${member.id}`] = setTimeout(
        free(member.id, member.guild.id),
        parse(time)
    );

    //find the correct probation role.
    const probation = member.guild.roles.cache.find((role) =>
        role.name.toLowerCase() === "probation"
    );

    //check to see if the proper role was found.
    if(!probation){
        report(client)(
            new Error(`Error: Could not find appropriate role during execution.`)
        );
        return;
    }

    //perform probation
    await member.roles.add(
        probation,
        `For ${time} by ${by === null ? "system" : by.nickname}. Reason: ${reason}`
    );

    //notify the infractor of their probation.
    const dm = await member.createDM();
    const appeals = member.guild.channels.cache.find((channel) =>
        channel.name === "appeals"
    );
    dm.send(
        `You've been placed on probation by ${by} for ${time} for the following reason: ${reason}. While on probation, you are not permitted to post in any text channel or join any voice channel. If you feel that this was in error, please speak to the admins in _#appeals_.`
    );
};