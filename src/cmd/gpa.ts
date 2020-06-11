import Command, {Permissions} from "../lib/command";
import {askString, choose} from "../lib/prompt";
import {Message} from "discord.js";

export default Command({
    names: ["gpa"],
    documentation:{
        description: "A semester GPA calculator.",
        group: "GENERAL",
        usage: "gpa",
    },

    check: Permissions.all,

    async exec(message: Message){

        //complete in DMs to maintain FERPA compliance
        message.reply("check your DMs to calculate your semester GPA.");
        const dm = await message.author.createDM();

        //get the number of classes
        let numClasses = await askString("How many classes are you taking?", dm);
        while (!parseInt(numClasses, 10)) {
            numClasses = await askString(
                "I'm sorry, I can't quite understand what you're saying. How many classes are you taking?",
                dm
            );
        }
        let classes = parseInt(numClasses);

        //for each class,
        var i;
        let totalHours: number = 0,
            totalPoints: number = 0;
        for (i = 1; i <= classes; i++) {

            //get credit hours for class i
            let hours = await askString(
                `How many credit hours for class ${i}?`,
                dm
            );
            while (!parseInt(hours, 10)) {
                hours = await askString(
                    `I'm sorry, I can't quite understand what you're saying. How many hours for class ${i}?`,
                    dm
                );
            }

            //get letter grade for class i
            let grade = await choose(
                `What was your letter grade in class ${i}? _(e.g. A, B, C, D, F)_`,
                ["A", "B", "C", "D", "F"],
                dm
            );

            //assign number of points per hour
            let points;
            switch (grade) {
                default:
                case 0:
                    points = 4;
                    break;
                case 1:
                    points = 3;
                    break;
                case 2:
                    points = 2;
                    break;
                case 3:
                    points = 1;
                    break;
                case 4:
                    points = 0;
                    break;
            }

            //get quality points and add QP to total points, and number of hours
            //to total hours
            let qualityPoints = parseInt(hours, 10) * points;
            totalPoints += qualityPoints;
            totalHours += parseInt(hours, 10);
        }

        //gpa = total points / total hours
        let gpa: number = totalPoints / totalHours;

        return dm.send(
            `**Total Points:** ${totalPoints}\n**Total Hours:** ${totalHours}\nYour semester GPA is **${gpa.toFixed(2)}**`
        );
    }
})