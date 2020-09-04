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
                {name: "Byrnes Hall Front Desk", value: "864.656.2140"},
                {name: "Zach's Phone", value: "803.546.9216"},
                {name: "{RA Phone 2}", value: "RA Phone 2"},
                {name: "CU Police / CAPS On-Call", value: "864.656.2222"},
                {name: "Redfern Health Center", value: "864.656.2233"},
                {name: "CCIT", value: "864.656.3494"},
                {name: "Maintenance", value: "864.656.5450"},
                {name: "Taylor Hanley, Byrnes/Lever Director", value: "tahanle@clemson.edu"},
                {name: "{BYRNES GRAD}", value: "{GRAD EMAIL}"},
                {name: "{LEVER GRAD}", value: "{GRAD EMAIL}"}
            );

        return message.channel.send(embed);
    },
});
