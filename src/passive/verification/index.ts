import {
    Guild,
    GuildMember, 
    PartialGuildMember, 
    DMChannel,
    Role,
    RoleManager,
    Invite
} from "discord.js";
import {askString} from "../../lib/prompt";
import approve from "./approve";
import {selectMajor} from "./selection";
import {roomNumbers} from "./majors";

/**
 * A function to find an existing role, or make a new one in a server
 * @param name the name of the role
 * @param guild the guild to find or make the role in
 * @return the role matching #name iff the role exists
 *         a new role iff a role matching #name does not exist
 */
export async function findOrMakeRole(name: string, guild: Guild): Promise<Role>{

    //find the role with the given name. If it doesn't exist, make a new one
    const existingRoles:RoleManager = await guild.roles.fetch();
    const role:Role = existingRoles.cache.find(role => role.name === name);

    return role
        ? Promise.resolve(role)
        : guild.roles.create({data: {name}});
}

/**
 * A function to complete the new user verification process
 * @param member the new member to verify
 */
export default async function verify(member: GuildMember | PartialGuildMember){
    const dm: DMChannel = await member.createDM();

    //greeting message
    dm.send(
        "Hello, and welcome to the Byrnes Hall 7th Floor Discord server! I'm ByrnesBot, your friendly neighborhood moderation bot. In order to gain access to the server, I need to verify who you are. Let's get started!"
    );
    
    //get resident's name
    const name:string = await askString("What is your name? (First name only, please!)", dm);
    dm.send(`Greetings, ${name}.`);
    
    //indeces and strings for college and major
    let major: string, override: boolean;
    let majorInfo: [string, boolean];

    //get resident's major
    do{
        majorInfo = await selectMajor(dm, override);
        major = majorInfo[0];
        override = majorInfo[1];
    }
    while (major === "BACK");

    //make additional variables
    let room: string, cuid: string, reason: string;

    //get user's cuid number
    cuid = await askString(
        "Got it. What's your CUID? _(Be sure to include the C!)_",
        dm
    );

    //get user's room number + validation
    room = await askString(
        "And what is your room number? (e.g. A7, D6, C3, etc.)",
        dm
    );
    while(!roomNumbers.includes(room.toUpperCase()) && room !== "OVERRIDE"){
        dm.send("I'm sorry, that room doesn't appear to exist. Be sure you say just the letter and number.");
        room = await askString(
            "What is your room number? (e.g. A7, D6, etc.)",
            dm
        );
    }

    //if an override was requested, get the resident's reason why
    if(override){
        reason = await askString(
            "My records indicate that you either requested an override, or something was incorrect during the process. Please explain below:", 
            dm
        );
    }

    dm.send(
        "Alright, I've got all your info. Sit tight and be sure you read the server rules. Your verification should be approved shortly!"
    );

    //log the verification
    let timestamp:Date = new Date();
    console.log(
        `VERIFIED ${member.user.username}#${member.user.discriminator}: ${name}, ${room}, ${cuid} at ${timestamp.toLocaleTimeString()}`
    );

    //auto-grant Resident role
    const roles:string[] = [await (await findOrMakeRole("Resident", member.guild)).id];
    let majorRole:Role = await findOrMakeRole(major.toUpperCase(), member.guild);
    roles.push(majorRole.id);

    if(!override){

        //assign roles for AD and BC side members
        if(room.includes("A") || room.includes("D")){
            roles.push(
                await (await findOrMakeRole("AD-Side", member.guild)).id
            );
        }
        else{
            roles.push(
                await (await findOrMakeRole("BC-Side", member.guild)).id
            );
        }
    }

    //send approval message
    const approved:boolean = await approve(member, name, room, cuid, roles, override, reason);

    //if approved, set the user's nickname and add the roles
    if(approved){
        dm.send(`Welcome to the server, ${name}!`);
        member.setNickname(`${name} | ${room.toUpperCase()}`);
        member.roles.add(roles);
    }

    //otherwise, generate a new invite link and send it to the user. Kick the user.
    else{
        const invite:Invite = await member.guild.channels.cache
            .find((channel) => channel.name === "rules")
            .createInvite({
                reason: `Invite for ${member.user.username}#${member.user.discriminator}`,
                maxUses: 1,
                temporary: true
            });

        dm.send(
            `Your verification was denied. If you believe this was in error, you can try again by joining below and requesting an override. ${invite.url}`
        );

        member.kick("Verification denied.");
    }
}