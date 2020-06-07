import {Message, GuildMember} from "discord.js";
import {timeoutCounts, timeout, lift, logTimeout, counts, setTimeoutCounts} from "../lib/timeout";
import parse from "parse-duration";
import Command, {Permissions} from "../lib/command";
import {authorization} from "../lib/access";

const owner = authorization("discord.owner");

export default Command({
    names: ["timeout"],
    
    documentation:{
        description:"Times out target members for a specified amount of time.",
        group: "ADMIN",
        usage: "timeout [<@User> ... <@User>] <Duration> <Reason>",
    },
    
    check: Permissions.admin,
    
    fail(message: Message){

        //checks awry messages, permissions, and timing out the owner/admins
        if(!message.guild) return;
        if(!message.member) return;
        if(message.mentions.members?.has(owner)){
            message.channel.send("I'm sorry, I'm afraid I can't do that.");
        }

        //hit them with that 'no u'
        timeout(
            message.member,
            message.member.guild.me as GuildMember,
            "5m",
            "Unauthorized use of timeout command."
        );
        setTimeout(lift(message.member), parse("5m"));
    },
    
    async exec(message: Message, args: string[]){

        //get members to be sentenced
        const targets = message.mentions.members;

        //checks to make sure targets are valid
        if(!targets){
            message.channel.send("Please specify members to time out.");
            return;
        }
        if(message.member === null) return;

        //get and verify timeout duration and reasoning
        const [duration, ...reason] = args.slice(targets.size);
        if(!duration){
            message.channel.send("Please specify a timeout interval.");
            return;
        }
        if(!reason){
            message.channel.send("You cannot place someone on probation for no reason.");
            return;
        }

        //perform and lift timeout
        targets.forEach((member) => {
            timeout(
                member,
                message.member as GuildMember,
                duration,
                reason.join(" ")
            );
            logTimeout(member);
            setTimeout(lift(member), parse(duration));
        });

        //reset timeoutCounts structure
        setTimeoutCounts();
    }
});