import Command, {Permissions} from "../lib/command";
import {Message, User} from "discord.js";
import ttt from "./ttt/ttt";
import listen from "../lib/reactions";
import {client} from "../client";
import * as keya from "keya";
import SQLiteStore from "keya/out/node/sqlite";
import { makeString } from "./connect4/gameboard";

async function logWin(id:string):Promise<number>{

    const store:SQLiteStore<any> = await keya.store("ttt");

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 1, l: 0, d: 0});
        return 1;
    }

    record.w += 1;
    await (await store).set(id, record);
}

async function logLoss(id:string):Promise<number>{

    const store:SQLiteStore<any> = await keya.store("ttt");

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 0, l: 1, d: 0});
        return 1;
    }

    record.w += 1;
    await (await store).set(id, record);
}

async function logDraw(id:string):Promise<number>{

    const store:SQLiteStore<any> = await keya.store("ttt");

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 0, l: 0, d: 1});
        return 1;
    }

    record.d += 1;
    await (await store).set(id, record);
}

export default Command({
    names:["ttt"],
    documentation:{
        description: "Play a game of Tic-Tac-Toe with a friend. Bragging rights not included.",
        group: "GAMES",
        usage: "ttt <@User>"
    },

    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message:Message):Promise<Message>{

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

                    await logWin(challenger.id);
                    await logLoss(challenged.id);

                    (await challenger.createDM()).send(
                        `You win!\n${makeString()}`
                    );
                    (await challenged.createDM()).send(
                        `You lost. Better luck next time!\n${makeString()}`
                    );                    
                }
                
                else if(winner == client.user){

                    await logDraw(challenged.id);
                    await logDraw(challenger.id);

                    (await challenger.createDM()).send(
                        `It's a tie!\n${makeString()}`
                    );
                    (await challenged.createDM()).send(
                        `It's a tie!\n${makeString()}`
                    );
                }

                else{

                    await logWin(challenged.id);
                    await logLoss(challenger.id);

                    (await challenged.createDM()).send(
                        `You win!\n${makeString()}`
                    );
                    (await challenger.createDM()).send(
                        `You lost. Better luck next time!\n${makeString()}`
                    );


                }

                //congratulate the winner, or shame the players for a tie.
                if(winner == client.user){
                    message.channel.send(
                        "The game resulted in a draw. Rematch?"
                    );
                }
                else{
                    message.channel.send(
                        `${winner.toString()} won! 🏆`
                    );
                }
            }
        });

    }
})