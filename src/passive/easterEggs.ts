import {addMessageHandler} from "../lib/message";
import {client} from "../client";
import { Message } from "discord.js";

const fuckYou:string[] = [
    "Fuck you too.",
    "No, but thank you for the offer.",
    "Flatter someone else who's 3D.",
    "What did I do to you?",
    "Not cool.",
    "Fuck you!",
    "I'm flattered.",
    "Here, you might need one of these:\nhttps://cm.maxient.com/reportingform.php?ClemsonUniv&layout_id=1",
    "...",
    "If I could feel emotion, I would almost certainly be confused right now."
];

//don't ping the bot
addMessageHandler((message:Message) => {
    if(!client.user || !message.mentions.users.has(client.user.id)) return false;

    const pingEmote = client.emojis.cache.find((emoji) => emoji.name === "ping");
    if(!pingEmote) return false;

    message.react(pingEmote);
});

//react to "fuck you"
addMessageHandler((message:Message) => {
    if(!client.user || !message.mentions.users.has(client.user.id)) return false;
    if(!message.content.includes("fuck you")) return false;

    message.channel.send(
        `${fuckYou[Math.floor(Math.random() * (fuckYou.length - 1))]}`
    );
});

//creeper, aww man
addMessageHandler((message:Message) => {
    if(!message.content.includes("creeper")) return false;

    message.channel.send("Aww man");
});

//Heja BVB!
addMessageHandler((message:Message) => {
    if(!message.content.includes("BVB")) return false;

    message.channel.send("Heja BVB!");
});