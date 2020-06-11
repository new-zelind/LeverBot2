import{
    Message,
    User,
    MessageReaction,
    Collector
} from "discord.js";

export default async function listen(
    message: Message,
    emojis: string[],
    callback: (
        vote: MessageReaction,
        collector: Collector<string, MessageReaction>
    ) => boolean | void | Promise<boolean> | Promise<void> 
) {

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