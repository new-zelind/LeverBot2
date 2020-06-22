import Command, {Permissions} from "../lib/command";
import {Message, User, TextChannel} from "discord.js";
import listen from "../lib/reactions";
import {client} from "../client";
import * as keya from "keya";

const store = keya.store("rps");

async function logWin(id:string):Promise<number>{

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 1, l: 0, d: 0});
        return 1;
    }

    record.w += 1;
    await (await store).set(id, record);
}

async function logLoss(id:string):Promise<number>{

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 0, l: 1, d: 0});
        return 1;
    }

    record.w += 1;
    await (await store).set(id, record);
}

async function logDraw(id:string):Promise<number>{

    let record = await (await store).get(id);

    if(!record){
        await (await store).set(id, {w: 0, l: 0, d: 1});
        return 1;
    }

    record.d += 1;
    await (await store).set(id, record);
}

async function getInput(user: User):Promise<string>{
    const dm = await user.createDM();

    const message = (await dm.send(
        "Choose your move:"
    )) as Message;

    await Promise.all([
        message.react("⛰️"),
        message.react("🧻"),
        message.react("✂️")
    ]);

    return new Promise((resolve) => 
        listen(message, ["⛰️", "🧻", "✂️"], (reaction) =>
            resolve(reaction.emoji.toString())
        )
    );
}

async function rps(
    output: TextChannel,
    challenger: User,
    challenged:User
):Promise<User>{
    const [challengerMove, challengedMove] = await Promise.all([
        getInput(challenger),
        getInput(challenged)
    ]);

    let winner: User | null = null;
    const result = 
        ["⛰️", "🧻", "✂️"].findIndex(v => v === challengerMove) -
        ["⛰️", "🧻", "✂️"].findIndex(v => v === challengedMove);

    switch (result){
        case 0:
            winner = null;
            break;

        case 2:
        case -1:
            winner = challenged;
            break;
        
        case 1:
        case -2:
            winner = challenger;
            break;
    }

    output.send(
        `${challenger.username}: ${challengerMove}.\n${challenged.username}: ${challengedMove}.\n${winner ? `${winner} wins!` : `It's a draw!`}`
    );

    return winner;
}

export default Command({
    names: ["rps"],
    documentation:{
        description: "Play a game of Rock-Paper-Scissors. Proven effective at resolivng conflicts.",
        group: "GAMES",
        usage: "rps <@User>"
    },

    check:Permissions.compose(
        Permissions.channel("bot-commands"),
        Permissions.guild
    ),

    fail(message:Message){
        message.channel.send("In _#bot-commands_, please!");
    },

    async exec(message:Message){
        let challenger:User = message.author;
        let challenged:User = message.mentions.users.first();

        if(!challenged){
            return message.channel.send("You need to challenge someone!");
        }

        if(challenged === message.author){
            return message.channel.send("Don't challenge yourself, dingus.");
        }

        if(challenged === client.user){
            return message.channel.send("I'm too good. Don't take me on.");
        }

        await message.react("🔥");

        listen(message, ["🔥"], async reaction => {
            const users = await reaction.users.fetch();

            if(users.has(challenged.id)){
                message.channel.send("Game on! Competitors, check your DMs!");
                
                const winner = await rps(message.channel as TextChannel, challenger, challenged);
            
                //send ending DMs
                if(winner === challenger){
                    let win:number = await logWin(challenger.id);
                    let loss:number = await logLoss(challenged.id);
                }
                else if(winner == null){
                    let draw1:number = await logDraw(challenger.id);
                    let draw2:number = await logDraw(challenged.id);
                }
                else{
                    let win:number = await logWin(challenged.id);
                    let loss:number = await logLoss(challenger.id);
                }
            }
        });
    }
});