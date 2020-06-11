import Command, {Permissions} from "../lib/command";
import { Message } from "discord.js";

export default Command({
    names: ["source"],
    documentation: {
        description: "See ByrnesBot's source code on GitHub.",
        group: "META",
        usage: "source"
    },

    check: Permissions.all,

    async exec(message: Message){
        return message.channel.send(
            //shameless github plug
            "**Here's my source code:**\nhttps://github.com/new-zelind/LeverBot2"
        );
    }
});