import Command, {Permissions} from "../lib/command";
import {Message, TextChannel} from "discord.js";

export default Command({
    names: ["rm"],

    documentation:{
        description: "Remove messages from a certain user, channel, or role",
        group: "ADMIN",
        usage: "rm <integer> [<@User> <@Role> <#Channel>",
    },

    check: Permissions.admin,

    async exec(message: Message, [count]: string[]){
        if(!message.mentions.users) return;

        let channel: TextChannel;

        const filters = {
            member: message.mentions.members.first(),
            channel: message.mentions.channels.first(),
            role: message.mentions.roles.first()
        };

        if(filters.channel instanceof TextChannel) channel = filters.channel;
        else channel = message.channel as TextChannel;

        let messages = await channel.messages.fetch({
            before: message.id,
            limit: 100,
        });

        if(filters.member){
            messages = messages.filter(
                (message) =>
                    message.member === null || message.member.id != filters.member?.id
            );
        }

        if(filters.role){
            messages = messages.filter(
                (message) =>
                    message.member === null ||
                    (filters.role !== undefined &&
                        message.member.roles.cache.has(filters.role.id))
            );
        }

        await Promise.all(
            messages
                .array()
                .slice(0, +count)
                .map((message) => message.delete())
        );

        return message.channel.send(`Deleted ${count} messages.`);
    }
});