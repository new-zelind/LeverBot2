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
        let numCitations = timeoutCounts[message.author.id];
        if(numCitations == null) numCitations = 0;
        return message.channel.send(
            `You have recieved **${numCitations}** citations.\nMaintain your compliance.\n_Glory to Byrnes/Lever._`
        );
    }
});