import * as keya from "keya";
import { Guild, Collection, TextChannel, Message, User, GuildMember } from "discord.js";
import Command, { Permissions } from "../lib/command";
import { makeEmbed } from "../lib/util";
import SQLiteStore from "keya/out/node/sqlite";
import { client } from "../client";
import { addMessageHandler } from "../lib/message";
import { config } from "../lib/access";

interface LBRecord{
  userID: string,
  total: number
}

/**
 * DON'T TOUCH
 * @param channel 
 */
async function fetchAll(channel: TextChannel) {
  let messages = await channel.messages.fetch({ limit: 100 });
  let pointer = messages.lastKey();
  let batch;

  do {
    batch = (
      await channel.messages.fetch({
        limit: 100,
        before: pointer,
      })
    ).filter((message) => !message.author.bot);

    pointer = batch.lastKey();
    messages = messages.concat(batch);
  } while (batch.size > 0);

  return messages;
}

async function getTotals(store: SQLiteStore<LBRecord>, message: Message) {

  store.clear();

  const guild = message.guild as Guild;

  const text = guild.channels.cache.filter(
    (channel) => channel.type === "text"
  ) as Collection<string, TextChannel>;

  const totals: { [key: string]: number } = {};

  for (const [, channel] of text) {
    const messages = await fetchAll(channel);
    messages.forEach((message) => {
      if (totals[message.author.id]) {
        totals[message.author.id]++;
      } else {
        totals[message.author.id] = 1;
      }
    });

    message.edit(
      (message.content += `\n${channel.name}: ${messages.size} messages`)
    );
  }

  // Set totals for everyone
  await Promise.all(
    Object.keys(totals).map(async (id) =>
      store.set(`${(message.guild as Guild).id}-${id}`,
        {userID: id, total: totals[id]}
      )
    )
  );
}

(async function() {
  const store = await keya.store<LBRecord>(`leaderboard`);

  const leaderboard = Command({
    names: ["leaderboard"],
    documentation: {
      usage: "leaderboard",
      description: "Lists people by their number of messages posted",
      group: "META",
    },

    check: Permissions.guild,

    async exec(message: Message & { guild: Guild }) {
      
      // Gets all records for the relevant guild
      const all = (await store.all()).filter((record) =>
        record.key.startsWith(message.guild.id)
      );

      // Sorts by the top
      const top = all.sort((a, b) => b.value.total - a.value.total);

      // Determines which user to center about, this is usually the message 
      // author but we will also allow them to pass another user
      const center =
        message.mentions.users.size > 0
          ? message.mentions.users.first()?.id ?? message.author.id
          : message.author.id;

      //construct min/max bounds
      const index = all.findIndex(
        (record) => `${message.guild.id}-${center}` === record.key
      );
      const min = Math.max(0, index - 5);
      const max = Math.min(all.length - 1, min + 10);

      // Constructs the leaderboard in the relevant section
      const ldb = top.slice(min, max).map(record => record.value);

      // Total message counts
      const total = all.reduce((a, b) => a + b.value.total, 0) as number;

      // Randomized titles from config file
      const titles = config("leaderboard.titles") as { [key: string]: string };
      const title = Object.keys(titles)[
        Math.round(Object.keys(titles).length * Math.random())
      ];

      // Format it into a string
      const description:string[] = [
        "**Stats**",
        `Total Messages Sent: ${total.toLocaleString()}`,]/*
        ...ldb.map(
          (record, i) => {
            let currUser: string = message.guild.members.cache.get(record.userID).nickname;
            `${min + i + 1}. ${currUser} — ${top[i + min].value.total.toLocaleString()} ${titles[title]}`;
          }
        ),
      ].join("\n");*/

      ldb.forEach(async (value:LBRecord, i:number) => {
        console.log(value);
        let currUser:string = (await client.users.fetch(value.userID)).toString();
        if(!currUser) currUser = "unknown";
        description.push(
          `${
            min + i + 1}. ${
            currUser} - ${
            top[i + min].value.toLocaleString()} ${
            titles[title]
          }\n`
        );
      });

      const embed = makeEmbed(message)
        .setTitle(title)
        .setDescription(description);

      return message.channel.send(embed);
    },
  });

  Command({
    names: ["tally"],
    documentation: {
      description: "Tallies the leaderboard",
      usage: "tally",
      group: "DEV",
    },

    check: Permissions.owner,

    async exec(message: Message) {

      const mess = (await message.channel.send(
        "Recalculating totals..."
      )) as Message;
      await getTotals(store, mess);

      const reply = (await message.reply("Done!")) as Message;
      leaderboard.exec(reply, ["10"]);

      return reply;
    },
  });

  // Increment messages
  addMessageHandler(async (message) => {
    if (!message.guild) return false;

    //find record for the current user
    let record = await store.get(`${message.guild.id}-${message.author.id}`);
    if(!record) record = {userID: message.author.id, total: 0};
    record.total++;

    await store.set(`${message.guild.id}-${message.author.id}`, record);

    return false;
  });
})();