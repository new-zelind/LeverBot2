import {
    Guild,
    GuildMember, 
    PartialGuildMember, 
    DMChannel,
    Role
} from "discord.js";
import {schools, engr, sci, cpsc, pph} from "./majors";
import {askString, choose} from "../../lib/prompt";
import approve from "./approve";
import {room} from "../../lib/access";

//lists of all valid CUIDS and room numbers on the floor
const CUIDS: string[] = room("cuids");
const rooms: string[] = room("rooms");

//array of confirmation responses
const valResponses: string[] = ["Y", "YES", "N", "No"];

//a function to find an existing role or make a new one
export async function findOrMakeRole(name: string, guild: Guild): Promise<Role>{

    //find the role with the given name. If it doesn't exist, make a new one
    const existingRoles = await guild.roles.fetch();
    const role = existingRoles.cache.find(role => role.name === name);

    return role
        ? Promise.resolve(role)
        : guild.roles.create({data: {name}});
}

export default async function verify(member: GuildMember | PartialGuildMember){
    const dm: DMChannel = await member.createDM();

    //greeting message
    dm.send(
        "Hello, and welcome to the Byrnes Hall 7th Floor Discord server! I'm ByrnesBot, your friendly neighborhood moderation bot. In order to gain access to the server, I need to verify who you are. Let's get started!"
    );
    
    //get resident's name
    const name = await askString("What is your name? (First name only, please!)", dm);
    dm.send(`Greetings, ${name}.`);
    
    //indeces and strings for college and major
    let collegeIndex: number, majorIndex: number;
    let college: string, major: string;

    do{
        //get resident's college
        collegeIndex = await choose(
            "Which college are you in?",
            schools,
            dm
        );
        college = schools[collegeIndex].toUpperCase();

        //confirm undeclared major
        if(college === "UNDECLARED"){
            let confirmation = await askString(
                "Confirm Undeclared? (Y/N)",
                dm
            );
            while(valResponses.indexOf(confirmation.toUpperCase()) == -1){
                dm.send("I can't quite understand what you said. Try again, please.");
                confirmation = await askString(
                    "Confirm Undeclared? (Y/N)",
                    dm
                )
            }
            major = confirmation === "Y" ? college : "BACK";
        }
        else {
            //yes, this entire thing is disgusting
            //yes, I spent literal weeks trying to figure out how to get it to work
            //but for some god-forsaken reason, hard-coding is the only way to get this bullshit to actually work
            
            //get major based on college
            dm.send("Which of these is your major?");
            switch(college){
                default:
                    console.log(`borked`);
                    break;
                case "ENGINEERING":
                    majorIndex = await choose(
                        `Enter "BACK" to reselect your college if you don't see your major.`,
                        engr as string[],
                        dm
                    );
                    if(majorIndex == engr.length-1) major = "BACK";
                    else major = "ENGINEERING";
                    break;
                case "SCIENCE":
                    majorIndex = await choose(
                        `Enter "BACK" to reselect your college if you don't see your major.`,
                        sci as string[],
                        dm
                    );
                    major = sci[majorIndex].toUpperCase();
                    break;
                case "COMPUTING":
                    majorIndex = await choose(
                        `Enter "BACK" to reselect your college if you don't see your major.`,
                        cpsc as string[],
                        dm
                    );
                    major = cpsc[majorIndex].toUpperCase();
                    break;
                case "PRE-PROFESSIONAL HEALTH":
                    majorIndex = await choose(
                        `Enter "BACK" to reselect your college if you don't see your major.`,
                        pph as string[],
                        dm
                    );
                    major = pph[majorIndex].toUpperCase();
                    break;
            }
        }
    } while (major.toUpperCase() === "BACK");

    let override = false;
    let index: number, room: string, cuid: string, reason: string;

    //get user's cuid number and confirm it exists
    cuid = await askString(
        "Got it. What's your CUID? _(Be sure to include the C!)_",
        dm
    );
    while(!CUIDS.includes(cuid.toUpperCase())){
        dm.send("I'm sorry, I can't seem to find that CUID. Try again, please.");
        cuid = await askString(
            "If you think this is in error, please type \`OVERRIDE\`",
            dm
        );

        //record that resident requested an override
        if(cuid.toUpperCase() === "OVERRIDE"){
            override = true;
            break;
        }
    }
    
    //find user's room number based on CUID
    room = rooms[CUIDS.indexOf(cuid)];

    //if the resident requested an override on CUID
    if(override){

        //manually get room number and resolve overrides
        room = await askString(
            "What is your room number? (e.g. A6, D7, etc.)",
            dm
        );
        while(!rooms.includes(room.toUpperCase())){
            dm.send(
                "I'm sorry, I can't seem to find that room number. Try again, please."
            );
            room = await askString(
                "If you think this is in error, please type \`OVERRIDE\`.",
                dm
            );
            if(room.toUpperCase() === "OVERRIDE"){
                break;
            }
        }        
    }
    else{
        //let the resident validate their room placement
        let validate = await askString(
            `Alright, I have you in ${room}. Is this correct? (Y/N)`,
            dm
        );
        while(!valResponses.includes(validate.toUpperCase())){
            dm.send("I'm sorry, I couldn't quite understand what you said.");
            validate = await askString(
                `I have you in room ${room}. Is this correct? (Y/N)`,
                dm
            );
        }

        //if incorrect, ask the user for their room number
        if(validate.toUpperCase() == "N" || validate.toUpperCase() === "NO"){
            room = (await askString(
                "My apologies. What is your room? (e.g. A6, D4, etc.)", 
                dm)
            ).toUpperCase();
            override = true;
        }
    }
    
    if(override){
        reason = await askString(
            "My records indicate that you either requested an override, or something was incorrect during the process. Please explain below:", 
            dm
        );
    }

    dm.send(
        "Alright, I've got all your info. Sit tight and be sure you read the server rules. Your verification should be approved shortly!"
    );

    console.log("VERIFY", name, room, college, major, cuid);

    //auto-grant Resident role
    const roles = [await (await findOrMakeRole("Resident", member.guild)).id];
    let majorRole = await findOrMakeRole(major.toUpperCase(), member.guild);
    roles.push(majorRole.id);

    if(!override){
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

    const approved = await approve(member, name, room, cuid, roles, override, reason);

    if(approved){
        dm.send(`Welcome to the server, ${name}!`);
        member.setNickname(`${name} | ${room}`);
        member.roles.add(roles);
    }
    else{
        const invite = await member.guild.channels.cache
            .find((channel) => channel.name === "rules")
            .createInvite({
                reason: `Invite for ${member.user.username}#${member.user.discriminator}`,
                maxUses: 1,
                temporary: true
            });

        dm.send(
            `Your verification was denied. If you believe this was in error, you can try again by joining below and requesting an override. ${invite.url}`
        );
    }
}