import {addMessageHandler} from "./message";
import "./command";
import {handle, isCommand, RESPONSES} from "./command";
import {client} from "../client";
import {Message} from "discord.js";

//ignore messages from the bot
addMessageHandler((message) => message.author.bot);

//load commands
addMessageHandler(handle);

//command editing - allows for parameter updates
client.on("messageUpdate", async (old, current) => {
    
    //ignore messages from the bot
    if(old.author.bot) return false;
    if(old.partial) old = await old.fetch();

    //delete the old response for updated command
    if(isCommand(old) && RESPONSES.has(old)){
        const response = RESPONSES.get(old) as Message;
        response.delete;
    }

    //handle the updated message
    return handle(current);
})