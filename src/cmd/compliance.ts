import Command, {Permissions} from "../lib/command";
import {timeoutCounts} from "../lib/timeout";

export default Command({
    names: ["compliance"],

    documentation: {
        description: "Check to see how many times you've been timed out.",
        group: "META",
        usage: "compliance"
    },

    check: Permissions.all,

    async exec(message){
        let userID: string = message.author.id;
        return message.channel.send(
            `You have recieved _${timeoutCounts[userID]}_ citations. Maintain your compliance. Glory to Byrnes/Lever.`
        );
    }
});