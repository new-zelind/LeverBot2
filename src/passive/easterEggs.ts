import {addMessageHandler} from "../lib/message";
import {client} from "../client";

addMessageHandler((message) => {
    if(!client.user || !message.mentions.users.has(client.user.id)) return false;

    const pingEmote = client.emojis.cache.find((emoji) => emoji.name === "ping");
    if(!pingEmote) return false;

    message.react(pingEmote);
    return true;
});