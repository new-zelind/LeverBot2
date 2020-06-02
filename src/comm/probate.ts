import {Message, GuildManager, GuildMember} from "discord.js";
import probate from "../passive/probation";
import Command, {Permissions} from "../lib/command";
import {authorization} from "../lib/access";
import * as keya from "keya";
import { exec } from "child_process";

const owner = authorization("discord.owner");

export const ProbateCommand = Command({
    names: ["probate"],
    documentation:{
        description:"Puts mentioned members on probation for a specified amount of time.",
        group: "ADMIN",
        usage: "probate <@User> ... <@User> <Duration> <Reason>",
    },
    check: Permissions.admin,

    fail(message: Message){
        if(!message.guild) return;
        message.channel.send("I'm sorry, I'm afraid I can't do that.");

        if(!message.member) return;

        probate(
            message.member,
            message.member.guild.me as GuildMember,
            "5m",
            "Unauthorized use of probate command."
        );
    },
    
    async exec(message: Message, args: string[]){
        const targets = message.mentions.members;
        if(!targets){
            message.channel.send("I need someone to probate!");
            return;
        }
        if(message.member === null) return;

        const [duration, ...reason] = args.slice(targets.size);

        targets.forEach((member) => {
            probate(
                member,
                message.member as GuildMember,
                duration,
                reason.join(" ")
            );
        });

        const store = await keya.store("probations");

        const executor: {
            citations: number;
            executed: number;
        } = (await store.get(message.member.id)) || {
            citations: 0,
            executed: 0,
        };
        const citations: {
            citations: number;
            executed: number;
        }[] = await Promise.all(
            targets.map((target) => store
                .get(target.id)
                .then((record) =>
                    (record ? record: {citations: 0, executed: 0}))
            )
        );

        executor.executed++;
    }
});