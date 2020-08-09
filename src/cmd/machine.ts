import Command, {Permissions} from "../lib/command";
import {Message, TextChannel} from "discord.js";
import * as os from "os";
import {code} from "../lib/util";

export default Command({
    names: ["machine"],
    documentation:{
        description: "Lists the machine that ByrnesBot is running on.",
        group: "DEV",
        usage: "machine"
    },

    check: Permissions.owner,

    fail(message: Message):Promise<Message>{
        return message.channel.send("I'm sorry. I'm afraid I can't do that.");
    },

    exec(message: Message):Promise<Message>{

        //sole purpose of this is to eliminate double runtime instances
        const {username}:os.UserInfo<String> = os.userInfo();
        const machine:string = os.hostname();
        const type:string = os.type();
        const arch:string = os.arch();

        return message.channel.send(
            code(`${username}@${machine}: ${type}${arch}`)
        );
    }
});