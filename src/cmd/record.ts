import Command, {Permissions} from "../lib/command";
import * as keya from "keya";
import {makeEmbed} from "../lib/util";
import {Message} from "discord.js";
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

async function reset(
    store:SQLiteStore<any>,
    id:string
):Promise<void>{
    await store.set(id, {w: 0, l: 0, d: 0});
}

export default Command({
    names:["record"],
    documentation:{
        description: "Check your W/L/D ratio for the bot's games. Use '-r' flag to reset your totals.",
        group: "GAMES",
        usage: "record [-r]"
    },

    check: Permissions.all,

    async exec(message: Message){

        //access keya database
        const tttStore = await keya.store("ttt");
        const conStore = await keya.store("connect4");
        const rpsStore = await keya.store("rps");
        const id = message.author.id;

        //reset flag handle
        if(message.content.includes("-r")){
            await reset(tttStore, id);
            await reset(conStore, id);
            await reset(rpsStore, id);
            message.channel.send(`Reset W/L/D for ${message.author.username}.`)
            return;
        }

        //a whole lotta bullshit
        let tttW:number = await getWins(tttStore, id);
        let tttL:number = await getLosses(tttStore, id);
        let tttD:number = await getDraws(tttStore, id);
        let tttTotal:number = tttW + tttL + tttD;
        let tttAvg:number = parseInt((tttW / tttTotal).toFixed(2));
        if(isNaN(tttAvg)) tttAvg = 0;

        let conW:number = await getWins(conStore, id);
        let conL:number = await getLosses(conStore, id);
        let conD:number = await getDraws(conStore, id);
        let conTotal:number = conW + conL + conD;
        let conAvg:number = parseInt((conW / conTotal).toFixed(2));
        if(isNaN(conAvg)) conAvg = 0;

        let rpsW:number = await getWins(rpsStore, id);
        let rpsL:number = await getLosses(rpsStore, id);
        let rpsD:number = await getDraws(rpsStore, id);
        let rpsTotal:number = rpsW + rpsL + rpsD;
        let rpsAvg:number = parseInt((rpsW / rpsTotal).toFixed(2));
        if(isNaN(rpsAvg)) rpsAvg = 0;

        //add TTT, Connect 4, and RPS statistics
        const embed = makeEmbed(message)
            .setColor("#F9E498")
            .setTitle(`${message.author.username}'s Game Record:`)
            .setDescription("See how well you've done vs other members.")
            .addFields(
                {
                    name: "**Tic-Tac-Toe**",
                    value: `WINS: ${tttW}\nLOSSES: ${tttL}\nDRAWS: ${tttD}\n*WIN %:* ${tttAvg}`
                },
                {
                    name: "**Connect 4**",
                    value: `WINS: ${conW}\nLOSSES: ${conL}\nDRAWS: ${conD}\n*WIN %:* ${conAvg}`
                },
                {
                    name: "**Rock Paper Scissors**",
                    value: `WINS: ${rpsW}\nLOSSES: ${rpsL}\nDRAWS: ${rpsD}\n*WIN %:* ${rpsAvg}`
                }
            );

        return message.channel.send(embed);
    }
});