import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";

export default Command({
    names: ["bubblewrap"],
    documentation:{
        description: "Pop pop pop!",
        group: "GAMES",
        usage: "bubblewrap"
    },
    
    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message:Message):Promise<Message>{
        let msg:string = "";
        for(var i = 1; i <= 5; i++){
            for(var j = 1; j <= 10; j++){
                msg = msg.concat("||pop!||");
            }
            msg = msg.concat('\n');
        }

        return message.channel.send(msg);
    }
})