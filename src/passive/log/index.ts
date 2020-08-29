import {addMessageHandler} from "../../lib/message";
import {
    TextChannel,
    Guild, 
    Message, 
    Role, 
    GuildMember, 
    Emoji,
    Channel
} from "discord.js";
import {code} from "../../lib/util";

//RegExp bullshit
function matchAll(str: string, re: RegExp){
    return (str.match(re) || [])
        .map((i) => RegExp(re.source, re.flags).exec(i))
        .filter((j) => j !== null)
}

//Cleans up role and user mentions
async function cleanUp(message: Message):Promise<string>{
    let content:string = message.content;

    //clean up the bullshit in role mentions
    const roles:{
        key:string,
        role:Role
    }[] = await Promise.all(
        matchAll(content, /<@#&([0-9]+)>/g).map(async (match) => ({
            key: (match as RegExpExecArray)[0],
            role: (message.guild as Guild).roles.cache.get(
                (match as RegExpExecArray)[1]
            ),
        }))
    );

    //clean up the bullshit in member mentions
    const members:{
        key: string,
        member: GuildMember
    }[] = await Promise.all(
        matchAll(content, /<@#&([0-9]+)>/g).map(async (match) => ({
            key: (match as RegExpExecArray)[0],
            member: (message.guild as Guild).members.cache.get(
                (match as RegExpExecArray)[1]
            ),
        }))
    );
    
    //clean up the bullshit in channel mentions
    const channels:{
        key: string,
        channel: Channel
    }[] = await Promise.all(
        matchAll(content, /<@#&([0-9]+)>/g).map(async (match) => ({
            key: (match as RegExpExecArray)[0],
            channel: (message.guild as Guild).channels.cache.get(
                (match as RegExpExecArray)[1]
            ),
        }))
    );

    //clean up the bullshit in emojis
    const emoji:{
        key: string,
        emoji: Emoji
    }[] = await Promise.all(
        matchAll(content, /<@#&([0-9]+)>/g).map(async (match) => ({
            key: (match as RegExpExecArray)[0],
            emoji: (message.guild as Guild).emojis.cache.get(
                (match as RegExpExecArray)[1]
            ),
        }))
    );

    //replace all role, user, channel mentions, emojis
    roles.forEach(({key, role}) =>
            (content = content.replace(key, `@[${role.name}]`))
    );
    members.forEach(({key, member}) =>
            (content = content.replace(key, `@[${member.nickname}]`))
    );
    emoji.forEach(({key, emoji}) =>
            (content = content.replace(key, `\:[${emoji.name}]:`))
    );
    channels.forEach(({key, channel}) =>
        content = content.replace(key, `#[${channel.toString()}]`)
    );
    
    return content;
}

/**
 * A function to split the message into chunks if the message size is greater
 * than 2000 characters
 * @param message The message to split into chunks
 */
async function splitMessagesLogically(message: string):Promise<string[]>{

    let messages:string[] = [];
    let msgIndex:number = 0;

    for(let [index, char] of Object.entries(message)){
        let i:number = +index;

        if(i >= 1999 || (i > 1800 && [" "].includes(char))){
            msgIndex++;
        }

        if(!messages[msgIndex]){
            messages[msgIndex] = "";
        }

        messages[msgIndex] += char;
    }

    return messages;
}

//a message handler to log every message sent in the server
addMessageHandler(async (message) => {

    //ignore messages in DMs and messages sent by the bot
    if(message.author.bot) return false;
    if(message.channel.type === "dm") return false;
    
    //find and validate the server log channel
    const serverLog = message.guild?.channels.cache.find(
        (channel) => channel.name === "server-log"
    ) as TextChannel;
    if(!serverLog) return false;

    //clean the content of user, role, channel, and emojis
    let fullContent:string = await cleanUp(message);

    //handle messages that get close to the character limit
    let msgList:string[] = await splitMessagesLogically(fullContent);

    //send message log header
    let toSend:string = "";
    toSend += `[${message.author.username}#${message.author.discriminator}]`;
    toSend += ` in ${message.channel.toString()} at `;
    toSend += `${message.createdAt.toLocaleString()}`;
    serverLog.send(toSend);

    //send the message(s) in the log
    msgList.forEach((str:string) => serverLog.send(code(str)));

    //log attachments, if necessary
    if(message.attachments.size > 0){
        serverLog.send(
            "_ATTACHMENTS:_",
            {
                files: message.attachments.map((attachment) => attachment.url),
                split: true
            }
        );
    }

    return false;
});