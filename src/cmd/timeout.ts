import {Message, GuildMember, Collection} from "discord.js";
import {timeout, sendLogEmbed} from "../lib/timeout";
import Command, {Permissions} from "../lib/command";
import {authorization} from "../lib/access";

const owner = authorization("discord.owner") as string;

export default Command({
    names: ["timeout"],
    documentation:{
        description: "Times out target members for a specified amount of time.",
        group: "ADMIN",
        usage: "timeout [<@User> ... <@User>] <Duration> <Reason>",
    },
    
    check: Permissions.any(
        Permissions.admin,
        Permissions.role("Mods")
    ),
    
    async fail(message: Message):Promise<Message>{

        //hit them with that 'no u'
        timeout(
            message.member,
            message.member.guild.me as GuildMember,
            "5m",
            "Unauthorized use of `timeout` command"
        );

        return message.channel.send("I'm sorry. I'm afraid I can't do that.");
    },
    
    async exec(message: Message, args: string[]):Promise<Message>{

        //get members to be sentenced
        const targets:Collection<string, GuildMember> = message.mentions.members;

        //checks to make sure targets are valid
        if(!targets){
            return message.channel.send("Please specify members to time out.");
        }
        if(message.member === null){
            return message.channel.send("I can't target that member.");
        };

        //don't time me out
        if(targets.has(owner)){
            return message.channel.send("I can't do that to my owner.");
        }

        //check for admins in the targets
        let isAdmin:boolean = false;
        targets.forEach(target => {
            if(target.hasPermission("ADMINISTRATOR")){
                isAdmin = true;
            }
        });
        if(isAdmin) return message.channel.send("I can't timeout an admin.");


        //get and verify timeout duration and reasoning
        const [duration, ...reason] = args.slice(targets.size);
        if(!duration){
            return message.channel.send("Please specify a timeout interval.");
        }
        if(!reason){
            return message.channel.send(
                "I cannot time someone out for no reason."
            );
        }

        //perform and log timeout
        targets.forEach((member) => {
            timeout(
                member,
                message.member as GuildMember,
                duration,
                reason.join(" ")
            );
            sendLogEmbed(
                member,
                message.member as GuildMember,
                duration,
                reason.join(" ")
            );
        });
    }
});