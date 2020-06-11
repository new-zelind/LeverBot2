import {
    Guild,
    GuildMember, 
    PartialGuildMember, 
    DMChannel
} from "discord.js";
import {schools, engr, sci, cpsc, pph} from "./majors";
import {askString, choose} from "../../lib/prompt";
import approve from "./approve";
import {room} from "../../lib/access";

//lists of all valid CUIDS and room numbers on the floor
const CUIDS: string[] = room("cuids");
const rooms: string[] = room("rooms");

//a function to find an existing role or make a new one
function findOrMakeRole(name: string, guild: Guild){

    //find the role with the given name. If it doesn't exist, make a new one
    let role = guild.roles.resolve(name);
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
            const confirmation = await choose(
                "Confirm Undeclared? (Y/N)",
                ["y", "yes", "yeah", "n", "no", "nope"],
                dm
            );
            major = confirmation >= 3 ? college : "BACK";
        }
        else {
            //yes, this entire things is disgusting
            //yes, I spent literal weeks trying to figure out how to get it to work
            //but for some god-forsaken reason, hard-coding is the only way to get this bullshit to actually work
            
            //get major based on college
            switch(college){
                default:
                    console.log(`fuck`);
                    break;
                case "ENGINEERING":
                    majorIndex = await choose(
                        `Which of these is your major?\nEnter "BACK" to reselect your college if you don't see your major.`,
                        engr as string[],
                        dm
                    );
                    major = engr[majorIndex].toUpperCase();
                    break;
                case "SCIENCE":
                    majorIndex = await choose(
                        `Which of these is your major?\nEnter "BACK" to reselect your college if you don't see your major.`,
                        sci as string[],
                        dm
                    );
                    major = sci[majorIndex].toUpperCase();
                    break;
                case "COMPUTING":
                    majorIndex = await choose(
                        `Which of these is your major?\nEnter "BACK" to reselect your college if you don't see your major.`,
                        cpsc as string[],
                        dm
                    );
                    major = cpsc[majorIndex].toUpperCase();
                    break;
                case "PRE-PROFESSIONAL HEALTH":
                    majorIndex = await choose(
                        `Which of these is your major?\nEnter "BACK" to reselect your college if you don't see your major.`,
                        pph as string[],
                        dm
                    );
                    major = pph[majorIndex].toUpperCase();
                    break;
            }
        }
    } while (major === "BACK");

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
            `Alright, I have you in 7${room}. Is this correct? (Y/N)`,
            dm
        );
        const valResponses: string[] = ["Y", "YES", "N", "No"];
        while(!valResponses.includes(validate.toUpperCase())){
            dm.send("I'm sorry, I couldn't quite understand what you said.");
            validate = await askString(
                `I have you in room 7${room}. Is this correct? (Y/N)`,
                dm
            );
        }

        //if incorrect, ask the user for their room number
        if(validate.toUpperCase() == "N"){
            room = (await askString(
                "My apologies. What is your room? (e.g. A6, D4, etc.)", 
                dm)
            ).toUpperCase();
            override = true;
        }
    }
    
    if(override){
        reason = await askString(
            "Either you requested an override or something went wrong during the process. Please explain below:", 
            dm
        );
    }

    dm.send(
        "Alright, I've got all your info. Sit tight and be sure you read the server rules. Your verification should be approved shortly!"
    );

    console.log("VERIFY", name, room, college, major, CUIDS[index]);

    //auto-grant verified and 7th floor roles
    const roles = ["576728934075596821", "576728017154605073"];
    let majorRole = await findOrMakeRole(major.toUpperCase(), member.guild);
    roles.push(majorRole.id);

    if(!override){
        if(room.includes("A") || room.includes("D")){
            roles.push("613539269134385173");
        }
        else{
            roles.push("613539227111784468");
        }
    }

    const approved = await approve(member, name, room, CUIDS[index], roles);

    if(approved){
        dm.send(`Welcome to the server, ${name}!`);
        member.setNickname(`${name} | ${room}`);
        member.roles.add(roles);
    }
    else{
        const invite = await member.guild.channels.cache
            .sort((a, b) => b.calculatedPosition - a.calculatedPosition)
            .first()
            .createInvite({
                reason: `Invite for ${name} | ${room} (${member.user.username}#${member.user.discriminator})`,
                maxUses: 1,
                maxAge: 300,
                temporary: true
            });

        dm.send(
            `Your verification was denied. If you believe this was in error, you can try again by joining below and requesting an override.${invite}`
        );
    }

}