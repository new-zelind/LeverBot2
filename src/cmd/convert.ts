import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";
import {inline} from "../lib/util";

const convert = require('convert-units');

export default Command({
    names: ["convert"],

    documentation:{
        description: "Converts 'unit1' to 'unit2'.",
        group: "GENERAL",
        usage: "{convert -l}: List of available measures\n{convert -m <measure>}: available units for a Measure\n{convert -c <number> <unit1> <unit2>}: perform Conversion"
    },

    check: Permissions.all,

    async exec(message: Message){

        const args:string[] = message.content.split(/ +/);
        if(args.length == 1){
            return message.channel.send(`I need some arguments to work with. Try ${inline("$help")} for more info.`);
        }
        if(args.length > 5){
            return message.channel.send(`Whoa, hey, too many arguments. Try ${inline("$help")} for more info.`);
        }    

        let flag:string = args[1].toLowerCase();
        let msg:string = "";
        switch(flag){
            case "-l":
                msg = convert().measures();
                break;

            case "-m":
                let measure:string = args[2].toLowerCase();

                if(convert().measures().includes(measure)){
                    msg = convert().possibilities(measure);
                }
                else{
                    msg = `No such measure ${measure}. Try ${inline("$convert -l")} to see a full list of measures.`;
                }

                break;

            case "-c":
                let num:number = parseFloat(args[2]);
                let unit1:string = args[3];
                let unit2:string = args[4];
                try{
                    let conversion:number = convert(num).from(unit1).to(unit2);
                    msg = `**Conversion**: ${conversion.toFixed(4)} ${unit2}.`;
                } catch{
                    msg = "Something went wrong. Make sure your units are of the same measure and try again.";
                }
                break;

            default:
                msg = "Sorry, I don't recognize that flag. Try again."
        }

        return message.channel.send(msg);

    }
})