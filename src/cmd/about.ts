import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";
import {client} from "../client";

export default Command({
    names: ["about"],
    documentation:{
        description: "Returns additional information about the bot.",
        group: "META",
        usage: "about"
    },

    check: Permissions.all,

    async exec(message){

        //make a new embed with the following information:
        const embed = makeEmbed(message)
            .setColor("#3A4958")
            .setTitle(`All about ${client.user.tag}:`)
            .setDescription("Nice to meet you.")
            .addFields(
                {
                    name: "Tell me about yourself, ByrnesBot.",
                    value: "Hello. I am ByrnesBot, a Discord.js application powered by Node.js. I am a moderation bot made for the Byrnes 5th Floor Discord Server, but have recently been installed on other servers around Clemson Housing."
                },
                {
                    name: "Who made you?",
                    value: "I'm afraid that's none of your business.\nJust kidding. I was made by Zach Lindler and Brendan McGuire, two Clemson Computer Science students, in the summer of 2019."
                },
                {
                    name: "What do you do?",
                    value: "I am the law around here, as well as Zach's second-in-command. I enforce the rules of the server. However, I have many useful commands that you can use. Try sending `$help` in _#bot-commands_ to see what all I can do."
                },
                {
                    name: "What if I find a bug?",
                    value: "While I assure you that my code is of the superior quality, it is inevitable that something may not go as planned. If you find a bug, please ping Zach and describe what you were doing, as well as what went wrong."
                },
                {
                    name: "Anything else?",
                    value: "I am not the only bot that Zach and Brendan have made. I have an older brother, Vexbot, who was made for the VEX Robotics Teams of South Carolina server, as well as a younger brother, AutoBLT, who was made for the Byrnes/Lever RA server. It's fun to mess with Vexbot, but AutoBLT can be a little annoying sometimes."
                }
            );

        return message.channel.send(embed);
    }
})