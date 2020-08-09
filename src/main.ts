import {
    GuildMember,
    Guild,
    User,
    Message,
    PartialMessage
} from "discord.js";
import {
    handleBanAdd,
    handleBanRemove,
    handleLeave,
    handleMessageDelete,
    handleMessageUpdate
} from "./passive/events";
import {handleMessage, addMessageHandler} from "./lib/message";
import {handle, isCommand, RESPONSES} from "./lib/command";
import {setTimeoutCounts} from "./lib/timeout";
import verify from "./passive/verification";
import report from "./lib/report";
import {client} from "./client";
import "./passive/easterEggs";
import "./passive/log/index";
import "./cmd";

const statuses:string[] = [
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
client.on("guildMemberAdd", (member:GuildMember) => {
    console.log(
        `AUTO-VERIFY ${member.user.username}#${member.user.discriminator}.`
    );
    verify(member);
});

//handle banhammers
client.on("guildBanAdd", (guild:Guild, user:User) => {
    handleBanAdd(guild, user);
});

//handle unbans
client.on("guildBanRemove", (guild:Guild, user:User) => {
    handleBanRemove(guild, user);
});

//handle users leaving/getting kicked
client.on("guildMemberRemove", (member:GuildMember) => {
    handleLeave(member);
});

//handle messages appropriately
client.on("message", handleMessage);

//handle a message deletion
client.on("messageDelete", (message:Message) => {
    handleMessageDelete(message);
});

//handle a message update
client.on("messageUpdate", async (old:PartialMessage, current:PartialMessage)=>{
    
    //ignore bot messages
    if(old.author?.bot) return false;

    //delete old command and update
    if(isCommand(old) && RESPONSES.has(old)) RESPONSES.get(old)?.delete();

    //handle serverlog update + new command response
    await handleMessageUpdate(old, current);
    return handle(current);
});

//error reporting
const reporter = report(client);
process.on("uncaughtException", (error:Error) => reporter(error));
process.on("unhandledRejection", (error:Error) => reporter(error));