import Command, {Permissions} from "../lib/command";
import * as keya from "keya";
import {makeEmbed} from "../lib/util";
import {Message, User} from "discord.js";
import SQLiteStore from "keya/out/node/sqlite";

async function getWins(
    store:SQLiteStore<any>,
    id:string
):Promise<number>{
    let record = await store.get(id);

    if(!record) return 0;

    return record.w;
}

async function getDraws(
    store:SQLiteStore<any>,
    id:string
):Promise<number>{
    let record = await store.get(id);

    if(!record) return 0;

    return record.d;
}

async function getLosses(
    store:SQLiteStore<any>,
    id:string
):Promise<number>{
    let record = await store.get(id);

    if(!record) return 0;

    return record.l;
}

export default Command({
    names:["record"],
    documentation:{
        description: "Check your W/L/D ratio for the bot's games.",
        group: "GAMES",
        usage: "record"
    },

    check: Permissions.all,

    async exec(message: Message){

        const tttStore = await keya.store("ttt");
        const conStore = await keya.store("connect4");
        const rpsStore = await keya.store("rps");
        const id = message.author.id;

        const embed = makeEmbed(message)
            .setColor("#F9E498")
            .setTitle(`${message.author.username}'s Game Record:`)
            .setDescription("See how well you've done vs other members.")
            .addFields(
                {
                    name: "Tic-Tac-Toe",
                    value: `WINS: ${getWins(tttStore, id)}\nLOSSES: ${getLosses(tttStore, id)}\nDRAWS: ${getDraws(tttStore, id)}`
                },
                {
                    name: "Connect 4",
                    value: `WINS: ${getWins(conStore, id)}\nLOSSES: ${getLosses(conStore, id)}\nDRAWS: ${getDraws(conStore, id)}`
                },
                {
                    name: "Rock Paper Scissors",
                    value: `WINS: ${getWins(rpsStore, id)}\nLOSSES: ${getLosses(rpsStore, id)}\nDRAWS: ${getDraws(rpsStore, id)}`
                }
            );
    }
})