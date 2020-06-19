import Command, {Permissions} from "../lib/command";
import {Message, User} from "discord.js";
import connect from "./conn4/connect";
import listen from "../lib/reactions";
import { client } from "../client";

export default Command({
    names:["connect"],
    documentation:{
        description: "Challenge a user to a glorous game of Connect 4!",
        group: "GENERAL",
        usage: "connect <@User>"
    },

    //in bot channel && not in dms
    //check: Permissions.compose(Permissions.channel("bots"), Permissions.guild),
    check:Permissions.all,

    fail(message:Message){
        return message.channel.send("In _#bot-commands_, please!");
    },

    async exec(message:Message){

        //users to do battle
        const challenger:User = message.author;
        const challenged:User = message.mentions.users.first();

        //nobody challenged
        if(!challenged){
            return message.channel.send("You need to challenge someone!");
        }

        //can't challenge the bot.
        if(challenged === client.user){
            return message.channel.send(
                "I can't play Connect 4. I'm just the means to the end here."
            );
        }

        await message.react("🔥");

        message.channel.send("Challenged: react with '🔥' to play!");

        listen(message, ["🔥"], async (reaction) => {
            const users = await reaction.users.fetch();

            if(users.has(challenged.id)){

                //start the game and record the winner
                message.channel.send(`Game on! Players, check your DMs. ${challenger.username} goes first.`);
                let winner:User = await connect(challenger, challenged);

                //congratulate the winner, or shame the players for a tie.
                if(winner == client.user){
                    message.channel.send("The game resulted in a draw.");
                }
                else{
                    message.channel.send(`${winner.toString()} won! 🏆`);
                }
            }
        });
    }
});