import Command, {Permissions} from "../lib/command";
import {Message, User} from "discord.js";
import connect from "./connect4/connect";
import listen from "../lib/reactions";
import { client } from "../client";
import * as keya from "keya";

async function logWin(id:string):Promise<number>{

    const store = await keya.store("connect4");

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 1, l: 0, d: 0});
        return 1;
    }

    record.w += 1;
    await (await store).set(id, record);
}

async function logLoss(id:string):Promise<number>{

    const store = await keya.store("connect4");

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 0, l: 1, d: 0});
        return 1;
    }

    record.w += 1;
    await (await store).set(id, record);
}

async function logDraw(id:string):Promise<number>{

    const store = await keya.store("connect4");

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 0, l: 0, d: 1});
        return 1;
    }

    record.d += 1;
    await (await store).set(id, record);
}

export default Command({
    names:["connect4"],
    documentation:{
        description: "Challenge someone to a glorous game of Connect 4.",
        group: "GAMES",
        usage: "connect4 <@User>"
    },

    /*check:Permissions.compose(
        Permissions.channel("bot-commands"),
        Permissions.guild
    ),*/
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

        //can't challenge yourself
        if(challenged === message.author){
            return message.channel.send("Don't challenge yourself, dingus.");
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
                message.channel.send(
                    `Game on! Players, check your DMs. ${challenger.username} goes first.`
                );
                let winner:User = await connect(challenger, challenged);

                //send ending DMs
                //send ending DMs
                if(winner === challenger){

                    let win:number = await logWin(challenger.id);
                    let loss:number = await logLoss(challenged.id);

                    (await challenger.createDM()).send(
                        `You win!\n_Win #${win}_`
                    );
                    (await challenged.createDM()).send(
                        `You lost. Better luck next time!\n_Loss #${loss}_`
                    );                    
                }
                else if(winner == client.user){

                    let draw1:number = await logDraw(challenger.id);
                    let draw2:number = await logDraw(challenged.id);

                    (await challenger.createDM()).send(
                        `It's a tie!\n_Draw #${draw1}_`
                    );
                    (await challenged.createDM()).send(
                        `It's a tie!\n_Draw #${draw2}_`
                    );
                }
                else{

                    let win:number = await logWin(challenged.id);
                    let loss:number = await logLoss(challenger.id);

                    (await challenged.createDM()).send(
                        `You win!\n_Win #${win}_`
                    );
                    (await challenger.createDM()).send(
                        `You lost. Better luck next time!\n_Loss #${loss}_`
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
});