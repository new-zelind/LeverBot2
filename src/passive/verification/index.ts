import {Guild, GuildMember, PartialGuildMember, DMChannel} from "discord.js";
import {askString, choose} from "../../lib/prompt";
import approve from "./approve";

/*const config: {
    majors: {[college: string]: string[]};
} = require("../../../config.json");*/
const config = require("../../../config.json");

const rooms = require("../../../rooms.json").pairs;

export function getRoom(cuid: string){
    return rooms.pairs[cuid] || null;
}

export function findOrMakeRole(name: string, guild: Guild){
    let role = guild.roles.resolve(name);
    return role
        ? Promise.resolve(role)
        : guild.roles.create({data: {name}});
}

export default async function verify(member: GuildMember | PartialGuildMember){
    const dm: DMChannel = await member.createDM();

    dm.send(
        "Hello, and welcome to the Byrnes Hall 7th Floor Discord server! I'm ByrnesBot, your friendly neighborhood Discord.js moderation bot. In order to gain access to the server, I need to verify who you are. Let's get started!"
    );
    const name = await askString("What is your name? (First name only, please!)", dm);
    dm.send(`Greetings, ${name}.`);
    let college, major

    do{
        college = await choose(
            "Which college are you in?",
            [config.majors],
            dm
        );

        if(college === "UNDECLARED"){
            const confirmation = await choose(
                "Confirm Undeclared? (Y/N)",
                ["y", "yes", "yeah", "n", "no", "nope"],
                dm
            );

            major = confirmation >= 3 ? college : "BACK";
        }
        else {
            dm.send("Which one of these is your major?");
            major = await choose(
                `${(config.majors[college]).map(j => `*${j}*`).join("\n")}
                \nEnter "BACK" to reselect your college if you don't see your major.`,
                config.majors[college],
                dm
            );
        }
    } while (major === "BACK");

    let complete = false;
    let override = false;
    let roomIndex: number, room: string, cuid: string;

    do{
        cuid = await askString("Alright, got it. What's your CUID?", dm);
        room = getRoom(cuid);
        while(room == null){
            cuid = await askString(
                "Hmm. I can't seem to find that CUID. Try again, please.\n_If you think this is in error, please type \"OVERRIDE\"._",
                dm);
            room = getRoom(cuid);
            if(room === "OVERRIDE"){
                roomIndex = await choose(
                    `My apologies. Alright, what is your room number? (e.g. A6, D4, etc.),`,
                    config.rooms,
                    dm
                );
                room = config.rooms[roomIndex];
                override = true;
            }
        }

        let validate = await choose(
            `Alright, I have you in 7${room}. Is this correct? (Y/N)`,
            ["Y", "Yes", "N", "No"],
            dm
        );

        if(validate >= 2){
            room = (await askString(
                "My apologies. What is your room? (e.g. A6, D4, etc.)\n_If you think this is in error, please type \"OVERRIDE\"._", 
                dm))
                .toString().toUpperCase();
        }

        if(room === "OVERRIDE"){
            override = true;
            break;
        }

        complete = true;
    } while (!override && !complete);

    let reason;
    if(override){
        reason = await askString(
            "Please enter your reason for requesting an override below:", 
            dm
        )
    }

    dm.send(
        "Alright, I've got all your info. Sit tight and be sure you read the server rules. Your verification should be approved shortly!"
    );

    console.log("VERIFY", name, room, college, major, cuid);

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

    const approved = await approve(member, name, room, cuid, roles);

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
            `Your verification was denied. If you believe this was in error, you can try again by joining below. ${invite}`
        );
    }

}