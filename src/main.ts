import * as Discord from "discord.js";
import {handle, isCommand, RESPONSES} from "./lib/command";
import report, {information} from "./lib/report";
import {handleMessage} from "./lib/message";
import * as Probation from "./passive/probation";
import verify from "./passive/verification";
import {client} from "./client";
import "./passive";
import "./comm";

const statuses = [
    "Watching over the server",
    "Did someone say cake?",
    "Byrnes > Lever",
    "Try $help!",
    "Watching AutoBLT",
    "Watching vexbot",
    "<Error>",
    "Throwing my GPA",
    "Playing with Captchas",
    "Programming sucks."
];

client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);

    //automatically update status once every minute
    try{
        setInterval(() => {
            const index = Math.floor(Math.random() * (statuses.length - 1));
            client.user.setActivity(statuses[index], {type: "CUSTOM_STATUS"});
        }, 60000);
    } catch {
        client.user.setActivity("B R O K E N", {type: "CUSTOM_STATUS"});
    }
});

//verify each member upon entry
client.on("guildMemberAdd", (member: Discord.GuildMember) => {verify(member);});

//handle messages appropriately
//add channel verification
client.on("message", handleMessage);

//error handling
const reporter = report(client);
process.on("uncaughtException", reporter);
process.on("unhandledRejection", reporter);