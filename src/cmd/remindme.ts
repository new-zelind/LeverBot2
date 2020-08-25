import Command, {Permissions} from "../lib/command";
import parse from "parse-duration";
import {Message, User, DMChannel} from "discord.js";

async function remindUser(text:string, user:User):Promise<Message>{
    const dm:DMChannel = await user.createDM();
    return await dm.send(
        `Hey, ${user.username}, you told me to remind you: ${text}`
    );
}

export default Command({
    names:["remindme"],
    documentation:{
        description:"Get the bot to remind you to do something.",
        group:"GENERAL",
        usage:"remindme <duration> <text>"
    },

    check:Permissions.any(
        Permissions.admin,
        Permissions.dm,
        Permissions.channel("bot-commands")
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In _#bot-commands_ or DMs, please!");
    },

    async exec(message:Message, args: string[]):Promise<Message>{
        
        const [duration, ...text] = args;
        if(!duration){
            return message.channel.send("Please specify an interval.");
        }
        if(!text){
            return message.channel.send("I need something to remind you of.");
        }

        const dm:DMChannel = await message.author.createDM();
        dm.send(
            `I'm going to remind you in ${duration} to ${text.join(" ")}.`
        );

        setTimeout(async () => {
            dm.send(
                `Hey, ${message.author.username}, you told me to remind you: ${text.join(" ")}`
            );
            
        }, parse(duration));
    }
});