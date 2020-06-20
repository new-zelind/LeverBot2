import Command, {Permissions} from "../lib/command";
import {Message, User, TextChannel} from "discord.js";
import listen from "../lib/reactions";
import {client} from "../client";

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

async function rps(output: TextChannel, challenger: User, challenged:User){
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
}

export default Command({
    names: ["rps"],
    documentation:{
        description: "Play a game of Rock-Paper-Scissors. Proven effective at resolivng conflicts.",
        group: "GAMES",
        usage: "rps <@User>"
    },

    /*check:Permissions.compose(
        Permissions.channel("bot-commands"),
        Permissions.guild
    ),*/
    check:Permissions.all,

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
                
                rps(message.channel as TextChannel, challenger, challenged);
            }
        });
    }
});