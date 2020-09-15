import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";
import {Message, MessageEmbed} from "discord.js";

export default Command ({
    names: ["contact"],
    documentation: {
        description: "Returns important contact information.",
        group: "GENERAL",
        usage:"contact",
    },

    check: Permissions.any(
        Permissions.channel("bot-commands"),
        Permissions.admin
    ),

    async fail(message:Message):Promise<Message>{
        return message.channel.send("In #bot-commands, please!");
    },

    async exec(message:Message):Promise<Message>{

        //make an embed with the following information:
        const embed:MessageEmbed = makeEmbed(message)
            .setColor("522D80")
            .setTitle("Contact Information")
            .setDescription("Here's a list of all important contact information.")
            .addFields(
                {name: "Byrnes RA On Call", value: "864.986.1111"},
                {name: "Lever RA On Call", value: "864.656.1113"},
                {name: "CU Police / CAPS On-Call", value: "864.656.2222"},
                {name: "Redfern Health Center", value: "864.656.2233"},
                {name: "CCIT", value: "864.656.3494"},
                {name: "Maintenance", value: "864.656.5450"},
                {name: "Taylor Hanley, Byrnes/Lever Director", value: "tahanle@clemson.edu"},
                {name: "Noah Burks, Byrnes Graduate Director", value: "nharrie@g.clemson.edu"},
                {name: "Pamela Ianiro, Lever Graduate Director", value: "pianiro@g.clemson.edu"}
            );

        return message.channel.send(embed);
    },
});
