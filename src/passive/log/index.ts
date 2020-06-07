import {addMessageHandler} from "../../lib/message";
import {
    TextChannel,
    Guild,
    Message,
} from "discord.js";
import {client} from "../../client";

function matchAll(str: string, re: RegExp){
    return (str.match(re) || [])
        .map((i) => RegExp(re.source, re.flags).exec(i))
        .filter((j) => j !== null)
}

async function cleanUp(message: Message) {
    let content = message.content;

    //clean up the bullshit in role and member mentions
    const roles = await Promise.all(
        matchAll(content, /<@&([0-9]+)>/g).map(async (match) => ({
            key: (match as RegExpExecArray)[0],
            role: (message.guild as Guild).roles.cache.get(
                (match as RegExpExecArray)[1]
            ),
        }))
    );
    const members = await Promise.all(
        matchAll(content, /<@!([0-9]+)>/g).map(async (match) => ({
            key: (match as RegExpExecArray)[0],
            member: (message.guild as Guild).members.cache.get(
                (match as RegExpExecArray)[1]
            ),
        }))
    );
    
    return content;
}

addMessageHandler(async (message) => {

    if(message.author.bot) return false;
    if(message.channel.type === "dm") return false;
    
    const serverLog = message.guild?.channels.cache.find(
        (channel) => channel.name === "server-log"
    ) as TextChannel;
    if(!serverLog) return false;
    serverLog.send(
        `[${message.author.username}#${message.author.discriminator}] in ${message.channel.toString()}: \`${await cleanUp(message)}\``,
        {
            files: message.attachments.map((attachment) => attachment.url),
        }
    );

    return false;
});

client.on("messageUpdate", async (old, current) => {
    if(old.partial) old = await old.fetch();
    if(current.partial) current = await current.fetch();
    if(old.author.bot) return true;
    if(old.channel.type === "dm") return false;

    const serverLog = old.guild?.channels.cache.find(
        (channel) => channel.name === "server-log"
    ) as TextChannel;
    if(!serverLog) return false;

    serverLog.send(
        `[${old.author.username}#${old.author.discriminator}] in ${old.channel.toString()}: \`${old.content.toString()}\` => \`${current.content.toString()}\``
    );
});