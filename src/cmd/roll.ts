import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";

export default Command({
    names: ["roll"],

    documentation:{
        description: "Roll some dice",
        group: "GAMES",
        usage: "roll `<number of dice>`d`<sides per die>` (ex. `roll 1d20+2`)"
    },

    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(
        message:Message,
        args:string[]
    ):Promise<Message>{
        
        const parse:RegExpMatchArray = args[0].match(
            /([0-9]+)?d([0-9]+)([+-][0-9]+)?/
        );
        if(!parse){
            return message.channel.send(
                "I can't undersand what you said. Check the help command for syntax."
            );
        }

        const [, qty, sides, modifier] = parse;

        if(!qty){
            return message.channel.send("I need a number of dice to roll!");
        }

        let sum:number = 0;
        let msg:string = `d${sides} roll x${qty ? qty : "1"}:\n`;

        for(let i = 0; i < +qty; i++){
            const result:number = Math.round(Math.random() * (+sides - 1) + 1);
            msg += `Roll ${i+1}: ${result}\n`;
            sum += result;
        }

        let mod:number = 0;
        if(modifier){
            const symbol:string = modifier[0];

            mod = +modifier.slice(1);

            if(symbol === "-") mod *= -1;
        }

        msg += `Total: ${sum}${modifier ? modifier : ""} = ${sum + mod}`;

        return message.channel.send(msg);
    }
});