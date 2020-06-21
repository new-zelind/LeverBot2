import Command, {Permissions} from "../lib/command";
import {Message, User} from "discord.js";
import ttt from "./ttt/ttt";
import listen from "../lib/reactions";
import {client} from "../client";

export default Command({
    names:["ttt"],
    documentation:{
        description: "Play a game of Tic-Tac-Toe with a friend. Bragging rights not included.",
        group: "GAMES",
        usage: "ttt <@User>"
    },

    /*
    check:Permissions.compose(
        Permissions.channel("bot-commands"),
        Permissions.guild
    ),
    */
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
            return message.channel.send("You need to challenge someone.");
        }

        //can't challenge yourself
        if(challenged === message.author){
            return message.channel.send("Don't challenge yourself, dingus.");
        }

        //can't challenge the bot
        if(challenged === client.user){
            return message.channel.send("Don't flatter yourself like that.");
        }

        await message.react("🔥");

        message.channel.send("Challenged: react with '🔥' to play!");
        
        listen(message, ["🔥"], async (reaction) => {
            const users = await reaction.users.fetch();

            if(users.has(challenged.id)){

                //start the game and record the winner
                message.channel.send(
                    `Game on! Players, check your DMs. ${challenger.username} goes first.`
                );
                let winner:User = await ttt(challenger, challenged);

                //send ending DMs
                if(winner === challenger){
                    (await challenger.createDM()).send("You win!");
                    (await challenged.createDM()).send(
                        "You lost. Better luck next time!"
                    );
                }
                else if(winner == client.user){
                    (await challenger.createDM()).send("It's a tie!");
                    (await challenged.createDM()).send("It's a tie!");
                }
                else{
                    (await challenged.createDM()).send("You win!");
                    (await challenger.createDM()).send(
                        "You lost. Better luck next time!"
                    );
                }

                //congratulate the winner, or shame the players for a tie.
                if(winner == client.user){
                    message.channel.send("The game resulted in a draw. Rematch?");
                }
                else{
                    message.channel.send(`${winner.toString()} won! 🏆`);
                }
            }
        });
    }
})