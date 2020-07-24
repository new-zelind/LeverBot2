import * as Discord from "discord.js";
import {handleMessage, addMessageHandler} from "./lib/message";
import verify from "./passive/verification";
import {client} from "./client";
import {setTimeoutCounts} from "./lib/timeout";
import {handle, isCommand, RESPONSES} from "./lib/command";
import "./cmd";
import "./passive/easterEggs";
import "./passive/log/index";
//import "./lib/handle";

const statuses = [
    "over the server",
    "TigerFlix",
    "y'all",
    "sports highlights",
    "AutoBLT",
    "Vexbot",
    "<ERROR>",
    "my GPA tank",
    "Football",
    "the guys in McAdams"
];

//on startup
client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);

    //initialize timeoutCounts structure on startup
    setTimeoutCounts();

    //ignore bot messages
    addMessageHandler((message) => message.author.bot);

    //handle commands
    addMessageHandler(handle);

    //automatically update status once every minute
    setInterval(() => {    
        const index:number = Math.floor(Math.random() * (statuses.length - 1));
        client.user.setActivity(statuses[index], {type: "WATCHING"});
    }, 60000);
});

//verify each member upon entry
client.on("guildMemberAdd", (member: Discord.GuildMember) => {
    console.log(
        `AUTO-VERIFY ${member.user.username}#${member.user.discriminator}.`
    );
    verify(member);
});

//handle messages appropriately
client.on("message", handleMessage);

client.on("messageUpdate", (old, current) => {
    
    //ignore bot messages
    if(old.author?.bot) return false;

    //delete old command and update
    if(isCommand(old) && RESPONSES.has(old)) RESPONSES.get(old)?.delete();
    return handle(current);
});

//error handling
//bot will be running on local machine, so just send it to the console
process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);