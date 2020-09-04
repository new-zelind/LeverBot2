import {
    Message,
    MessageReaction,
    TextChannel,
    User,
    PartialUser
} from "discord.js";
import * as keya from "keya";
import SQLiteStore from "keya/out/node/sqlite";
import {client} from "../client";
import {code} from "../lib/util";

//number of upvotes to be in the wall of fame
const THRESHOLD:number = 5;

// array to hold rankings assigned to messages
const rankings:string[] = [
    "⭐ POPULAR",                   // 1 * THRESHOLD
    "🏅 QUALITY",                   // 2 * THRESHOLD
    "🥉 *THE PEOPLE HAVE SPOKEN*",  // 3 * THRESHOLD
    "🥈 *INCREDIBLE*",              // 4 * THRESHOLD
    "🥇 **LEGENDARY**",             // 5 * THRESHOLD
    "🏆 ***GOD-TIER***",            // 6 * THRESHOLD
];

/**
 * A function to create a fully formatted wall of fame message
 * @param message the message being added to the wall of fame
 * @param doots the current number of upvotes on #message
 * @return a fully formatted string containing the ranking, number of upvotes,
 *         the author, the channel, and the content of the message
 */
async function makeMessage(message:Message, doots:number):Promise<string>{
    let msg:string = `**WALL OF FAME**:`;
    msg += `\n${rankings[Math.floor((doots - THRESHOLD)/THRESHOLD)]} - `;
    msg += `${doots} upvote(s)`;
    msg += `\n_By ${message.member.nickname} in ${message.channel.toString()}_`;
    msg += `\n${code(message.content)}\n`;
    return msg;    
}

/**
 * A function to remove a message from the wall of fame
 * @param message an instance of the original message
 * @return true iff the message was successfully removed from both the wall of
 *         fame && the keya store
 */
async function remove(message: Message):Promise<boolean>{

    //get #wall-of-fame channel
    const wofChannel = message.guild.channels.cache.find(
        ch => ch.name === "wall-of-fame"
    ) as TextChannel;
    if(!wofChannel) return false;

    //get SQL store
    const store:SQLiteStore<any> = await keya.store<any>('wof');

    //get the ID of message in #wall-of-fame to delete
    const msgToDeleteID:string = await store.get(message.id);

    //delete the message
    const msgToDelete:Message = await wofChannel.messages.fetch(msgToDeleteID);
    await msgToDelete.delete();

    //remove the message from the keya store and return true
    await store.delete(message.id);
    return true;
}

/**
 * A function to add a message to the wall of fame
 * @param message the message to be added
 * @return true iff the message was sent in the wall of fame channel and
 *         recorded in the keya database
 */
async function add(message: Message):Promise<boolean>{

    //Get #wall-of-fame channel
    const wofChannel = message.guild.channels.cache.find(
        ch => ch.name === "wall-of-fame"
    ) as TextChannel;
    if(!wofChannel) return false;

    //get SQL store
    const store:SQLiteStore<any> = await keya.store<any>('wof');

    //make the message content and send it in wall of fame
    const content:string = await makeMessage(message, THRESHOLD);
    let msg:Message = await wofChannel.send(content);

    //add the message to the store and return
    await store.set(message.id, msg.id);
    return true;
}

/**
 * A function to update the wall of fame entry for a message
 * @param message the message to be updated
 * @param doots the current number of upvotes on the message
 * @return true iff the wall of fame message was updated correctly and the keya
 *         database entry was updated correctly
 */
async function update(message:Message, doots:number):Promise<boolean>{

    //Get #wall-of-fame channel
    const wofChannel = message.guild.channels.cache.find(
        ch => ch.name === "wall-of-fame"
    ) as TextChannel;
    if(!wofChannel) return false;

    //get SQL store
    const store:SQLiteStore<any> = await keya.store<any>('wof');

    //get the ID of message in #wall-of-fame to delete
    const msgToUpdateID:string = await store.get(message.id);

    //update the message
    const msgToUpdate:Message = await wofChannel.messages.fetch(msgToUpdateID);
    await msgToUpdate.edit(await makeMessage(message, doots));

    //update store in keya
    await store.delete(message.id);
    await store.set(message.id, msgToUpdateID);

    return true;
}

/**
 * A function to update a message in the Wall of Fame
 * @param reaction the upvote reaction added or removed
 * @param user the user who voted, or removed their vote
 * @param bit true if the reaction was added, false if the reaction was removed
 */
async function updateWallOfFame(
    reaction: MessageReaction,
    bit: boolean
):Promise<void>{

    let msg:Message = reaction.message;
    let doots:number = reaction.count;

    //if the reaction was added and the number of upvote reactions is 5,
    //add the message to the wall of fame
    //FIXME
    if(bit && doots == 1) add(msg);

    //if the reaction was added, but the number of reaction is not 5, update
    //the wall of fame message
    else if(bit) update(msg, doots);

    //if the reaction was removed, but the number of reactions is still greater
    //than 5, update the wall of fame message
    //FIXME
    else if(!bit && doots >= 1) update(msg, doots);

    //if the reaction was removed and the number of reactions is less than 5,
    //remove the message from the wall of fame
    else remove(msg);
}

/**
 * A function to check if #reaction.message is eligible for the Wall of Fame
 * @param reaction an instance of the upvote reaction
 * @param user the user who added or removed their reaction
 * @return true iff:
 *          #reaction name is "upvote"
 *          #reaction.message is less than 48 hours old
 *          #user.id is not the original message's author
 *          #user.id is not the bot
 *          #reaction count is greater than or equal to 5
 *          ---------------------------------------------
 *          if any of the above are true, return false
 */
async function checkForUpdate(
    reaction:MessageReaction,
    user:User | PartialUser
):Promise<boolean>{

    //only works for 'upvote' emote
    if(!(reaction.emoji.name === "upvote")) return false;

    //voting open for 48 hours
    if((Date.now()-reaction.message.createdTimestamp) > 172800000) return false;

    //don't update if OP reacts - can't upvote your own posts
    if(user.id === reaction.message.author.id) return false;

    //don't update if it's a bot message - can't upvote message in WOF
    if(reaction.message.author.id === client.user.id) return false;

    //only consider messages with 5 or more legal upvotes
    if(reaction.count < 5) return false;
    
    return true;
}

export {checkForUpdate, updateWallOfFame};