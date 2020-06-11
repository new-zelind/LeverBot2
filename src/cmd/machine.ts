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

    exec(message: Message){

        //sole purpose of this is to eliminate double runtime instances
        const {username} = os.userInfo();
        const machine = os.hostname();
        const type = os.type();
        const arch = os.arch();

        return message.channel.send(
            code(`${username}@${machine}: ${type}${arch}`)
        );
    }
});