import Command, {Permissions} from "../lib/command";
import {Channel, Message, TextChannel} from "discord.js";

export default Command({
    names:["send"],
    documentation:{
        description: "Under construction",
        group:"GENERAL",
        usage:"Under construction"
    },

    check: Permissions.admin,

    async fail(message:Message):Promise<Message>{
        return message.channel.send("Did you read the docs?");
    },

    async exec(message: Message, [...text]):Promise<Message>{
        let channelID:string = "719328279718264883";
        let channel:TextChannel = (
            message.guild.channels.cache.get(channelID)
        ) as TextChannel;

        let msg:string = message.content.substring(
            message.content.indexOf(" ") + 1,
            message.content.length
        );
        msg.concat("\n");

        return channel.send(msg + "\n");
    }
});