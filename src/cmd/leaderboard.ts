import * as keya from "keya";
import { Guild, Collection, TextChannel, Message } from "discord.js";
import Command, { Permissions } from "../lib/command";
import { makeEmbed } from "../lib/util";
import SQLiteStore from "keya/out/node/sqlite";
import { client } from "../client";
import { addMessageHandler } from "../lib/message";
import { config } from "../lib/access";

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

interface MessageTotals {
  total: number;
}

async function getTotals(store: SQLiteStore<MessageTotals>, message: Message) {
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
      (message.content += `\n${channel.toString()}: ${messages.size} messages`)
    );
  }

  // Set totals for everyone
  await Promise.all(
    Object.keys(totals).map(async (id) =>
      store.set(`${(message.guild as Guild).id}-${id}`, {
        total: totals[id],
      })
    )
  );
}

interface LeaderboardRecord {
  total: number;
}

(async function() {
  const store = await keya.store<LeaderboardRecord>(`leaderboard`);

  const leaderboard = Command({
    names: ["leaderboard"],
    documentation: {
      usage: "leaderboard",
      description: "Lists people by their number of messages posted",
      group: "META",
    },

    check: Permissions.any(
      Permissions.channel("bot-commands"),
      Permissions.admin
    ),

    async fail(message: Message){
      return message.channel.send("In _#bot-commands_, please!");
    },

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

      // Make the bounds from that index
      const index = all.findIndex(
        (record) => `${message.guild.id}-${center}` === record.key
      );
      const min = Math.max(0, index - 5);
      const max = Math.min(all.length - 1, min + 10);

      // Constructs the leaderboard in the relevant section
      const leaderboard = top
        .slice(min, max)
        .map((v) => client.users.cache.get(v.key.split("-")[1]));

      // Total message counts
      const total = all.reduce((a, b) => a + b.value.total, 0) as number;

      // Randomized titles from config file
      const titles = config("leaderboard.titles") as { [key: string]: string };
      const title = Object.keys(titles)[
        Math.round(Object.keys(titles).length * Math.random())
      ];

      // Format it into a string
      const description = [
        "**Stats**",
        `Total Messages Sent: ${total.toLocaleString()}`,
        ...leaderboard.map(
          (k, i) =>
            `${min + i + 1}. ${k.toString()} — ${top[i + min].value.total} ${
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
    names: ["tally"],
    documentation: {
      description: "Tallies the leaderboard",
      usage: "tally",
      group: "DEV",
    },

    check: Permissions.admin,

    async fail(message:Message){
      return message.channel.send("I'm sorry, I'm afraid I can't do that.");
    },

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
    if (!message.guild) {
      return false;
    }

    const record = (await store.get(
      `${message.guild.id}-${message.author.id}`
    )) || { total: 0};

    record.total++;

    await store.set(`${message.guild.id}-${message.author.id}`, record);

    return false;
  });
})();