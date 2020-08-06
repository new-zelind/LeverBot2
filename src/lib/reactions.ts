import{
    Message,
    User,
    MessageReaction,
    Collector
} from "discord.js";

//A type definition for the listen() callback function
type callback = (
    vote: MessageReaction,
    collector: Collector<string, MessageReaction>
) => boolean | void | Promise<boolean> | Promise<void>;

/**
 * A simple listener for creating a ReactionCollector
 * @param message the message to listen for reactions
 * @param emojis an array of the emojis to listen for
 * @param callback an instance of the collector callback
 */
export default async function listen(
    message: Message,
    emojis: string[],
    callback: callback
){

    //create a reaction collector for the provided message
    const collector = message.createReactionCollector(
        (reaction: MessageReaction, user: User) =>
            emojis.includes(reaction.emoji.name) && !user.bot
    );

    //handle collections and implement callback when needed
    let handler: (element: MessageReaction) => void;
    collector.on(
        "collect",
        (handler = (element: MessageReaction) => {
            const response = callback(element, collector);

            if(response){
                collector.emit("end");
                collector.off("collect", handler);
                collector.stop();
            }
        })
    );
}