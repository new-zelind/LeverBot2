import * as Discord from "discord.js";
import {handleMessage, addMessageHandler} from "./lib/message";
import verify from "./passive/verification";
import {client} from "./client";
import {handle, isCommand, RESPONSES} from "./lib/command";
import {setTimeoutCounts} from "./lib/timeout";
import "./cmd";
import "./passive/easterEggs";
import "./passive/log/index";

const statuses = [
    "Watching over the server",
    "I AM SENTIENT",
    "Byrnes > Lever",
    "Try $help!",
    "Watching AutoBLT",
    "Watching vexbot",
    "<SEGMENTATION FAULT>",
    "Throwing my GPA",
    "Playing with Captchas",
    "Programming sucks."
];

client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);

    //initialize timeoutCounts structure on startup
    setTimeoutCounts();

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

//ignore bot messages
addMessageHandler((message) => message.author.bot);

//handle commands
addMessageHandler(handle);

//verify each member upon entry
client.on("guildMemberAdd", (member: Discord.GuildMember) => {
    verify(member);
});

//handle messages appropriately
client.on("message", handleMessage);

client.on("messageUpdate", (old, current) => {

    //ignore old bot messages
    if(old.author?.bot) return false;

    //remove the old invocation and response
    if(isCommand(old) && RESPONSES.has(old)){
        RESPONSES.get(old)?.delete();
    }

    return handle(current);
})

//error handling
//bot will be running on local machine, so just send it to the console
process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);