import Command, {Permissions} from "../lib/command";
import {Message, User} from "discord.js";
import connect from "./conn4/connect";

export default Command({
    names:["connect"],
    documentation:{
        description: "Challenge a user to a glorous game of Connect 4!",
        group: "GENERAL",
        usage: "connect <@User>"
    },

    check: Permissions.compose(Permissions.channel("bot-commands"), Permissions.guild),

    fail(message:Message){
        return message.channel.send("In _#bot-commands_, please!");
    },

    async exec(message:Message){

        //users to do battle
        const challenger:User = message.author;
        const challenged:User = message.mentions.users.first();

        await connect(challenger, challenged);

        return;
    }
})