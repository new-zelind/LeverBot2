import Command, {Permissions} from "../lib/command";
import {Message, TextChannel} from "discord.js";

export default Command({
    names: ["rm"],
    documentation:{
        description: "Remove messages from a certain user, channel, or role",
        group: "ADMIN",
        usage: "rm <integer> [<@User> <@Role> <#Channel>]",
    },

    check: Permissions.admin,

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
        return message.channel.send(`Deleted ${count} messages.`);
    }
});