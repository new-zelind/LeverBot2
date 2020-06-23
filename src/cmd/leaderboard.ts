import {Guild, Collection, TextChannel, Message} from "discord.js";
import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";
import {client} from "../client";
import {addMessageHandler} from "../lib/message";
import {config} from "../lib/access";
import * as keya from "keya";
import SQLiteStore from "keya/out/node/sqlite";

async function fetchAll(channel:TextChannel){
    let messages = await channel.messages.fetch({limit:100});
    let pointer = messages.lastKey();
    let batch;

    process.stdout.write(" fetching");

    do{
        batch = (
            await channel.messages.fetch({
                limit: 100,
                before: pointer
            })
        ).filter(message => !message.author.bot);

        pointer = batch.lastKey();
        messages = messages.concat(batch);

        process.stdout.write(".");
    } while (batch.size > 0);

    console.log("");

    return messages;
}

interface MessageTotals{
    total: number;
}

async function getTotals(store:SQLiteStore<MessageTotals>, message:Message){
    const guild = message.guild as Guild;

    const text = guild.channels.cache.filter(
        (channel) => channel.type === "text"
    ) as Collection<string, TextChannel>;

    const totals:{[key:string]:number} = {};

    for(const [, channel] of text){
        console.log(`Tallying ${channel.name}...`);
        const messages = await fetchAll(channel);

        messages.forEach(message => {
            if(totals[message.author.id]) totals[message.author.id]++;
            else totals[message.author.id] = 1;
        });

        console.log(`Retrieved ${messages.size} messages.`);

        message.edit(
            (message.content += `\n${channel.name}: ${messages.size} messages`)
        );
    }

    await Promise.all(
        Object.keys(totals).map(async id =>
            store.set(`${(message.guild as Guild).id}-${id}`, {
                total: totals[id]
            })
        )
    );
}

interface LeaderboardRecord{
    total:number
}

(async function (){
    const store = await keya.store<LeaderboardRecord>(`leaderboard`);

    const leaderboard = Command({
        names:["leaderboard"],
        documentation:{
            description: "See where you rank on the message leaderboard.",
            group: "META",
            usage: "leaderboard [<integer>]"
        },

        check:Permissions.guild,

        async exec(message: Message & {guild: Guild}){
            const all = (await store.all()).filter((record) =>
                record.key.startsWith(message.guild.id)
            );

            const top = all.sort((a, b) => b.value.total - a.value.total);

            const center =
                message.mentions.users.size > 0
                    ? message.mentions.users.first()?.id ?? message.author.id
                    : message.author.id;

            const index = all.findIndex(
                (record) => `${message.guild.id}-${center} === record.key`
            );

            const min = Math.max(0, index - 5);
            const max = Math.min(all.length - 1, min + 10);

            const leaderboard = top
                .slice(min, max)
                .map((v) => client.users.cache.get(v.key.split("-")[1]));

            const total = all.reduce((a, b) => a + b.value.total, 0) as number;
            
            const titles = config("leaderboard.titles") as {[key:string]:string};
            const title = Object.keys(titles)[
                Math.round(Object.keys(titles).length * Math.random())
            ];

            const description = [
                "**STATS**:",
                `Total Messages Sent: ${total.toLocaleString()}`,
                ...leaderboard.map(
                    (k, i) =>
                        `${min + i + 1}. ${k} - ${top[i + min].value.total} ${
                            titles[title]
                        }`
                ),
            ].join("\n");

            const embed = makeEmbed(message)
                .setTitle(title)
                .setDescription(description);

            return message.channel.send(embed);
        },
    });

    Command({
        names:["tally"],
        documentation:{
            description: "Tally the leaderboard",
            usage: "tally",
            group: "DEV"
        },

        check:Permissions.admin,

        fail(message:Message){
            return message.channel.send("Not right now. I'm feeling lazy.");
        },

        async exec(message:Message){
            const msg = (await message.channel.send(
                "Recalculating totals..."
            )) as Message;
            await getTotals(store, msg);

            const reply = (await message.reply("Done!")) as Message;
            leaderboard.exec(reply, ["10"]);

            return reply;
        }
    });

    addMessageHandler(async (message) => {
        if(!message.guild) return false;

        const record = (await store.get(
            `${message.guild.id}-${message.author.id}`
        )) || {total:0};

        record.total++;

        await store.set(`${message.guild.id}-${message.author.id}`, record);

        return false;
    });
})();