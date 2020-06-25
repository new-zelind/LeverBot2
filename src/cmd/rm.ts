import Command, {Permissions} from "../lib/command";
import {Message, TextChannel} from "discord.js";
import {timeout} from "../lib/timeout";

export default Command({
    names: ["rm"],
    documentation:{
        description: "Remove a specified number of messages.",
        group: "ADMIN",
        usage: "rm <integer>",
    },

    check: Permissions.admin,

    fail(message: Message){
        timeout(
            message.member,
            message.member.guild.me,
            "5m",
            "Unauthorized use of `rm` command"
        );
        return message.channel.send("I'm sorry. I'm afraid I can't do that.");
    },

    async exec(message: Message, [count]: string[]){
        if(!message.mentions.users) return;

        let channel: TextChannel;

        //create filters (if applicable)
        const filters = {
            member: message.mentions.members.first(),
            channel: message.mentions.channels.first(),
            role: message.mentions.roles.first()
        };

        //set the channel to delete messages from
        if(filters.channel instanceof TextChannel) channel = filters.channel;
        else channel = message.channel as TextChannel;

        //parse number of messages to delete
        let messages = await channel.messages.fetch({
            before: message.id,
            limit: 100,
        });
        
        //if a member was mentioned, filter messages by member
        if(filters.member){
            messages = messages.filter(
                (message) =>
                    message.member === null || message.member.id != filters.member?.id
            );
        }

        //if a role was mentioned, filter messages by role
        if(filters.role){
            messages = messages.filter(
                (message) =>
                    message.member === null ||
                    (filters.role !== undefined &&
                        message.member.roles.cache.has(filters.role.id))
            );
        }

        //delete the specified number of messages following any filters
        await Promise.all(
            messages
                .array()
                .slice(0, +count)
                .map((message) => message.delete())
        );

        //confirmation of completion
        message.channel.send(`Deleted ${count} messages.`);
    }
});