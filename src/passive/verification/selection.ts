import{
    COLLEGES,
    CAFLS,
    CAAH,
    CBSHS,
    CBUS,
    CEDU,
    CECAS,
    CSCI
} from "./majors";
import {DMChannel} from "discord.js";
import {choose, askString} from "../../lib/prompt";

const valResponses: string[] = ["Y", "YES", "N", "NO"];

function assign(major: string, override: boolean): [string, boolean]{
    return [major, override];
}

export async function selectMajor(
    dm: DMChannel,
    override: boolean
): Promise<[string, boolean]>{
    let collegeIndex: number, majorIndex: number;
    let college: string, major: string;

    collegeIndex = await choose(
        "Which college are you in?",
        COLLEGES,
        dm
    );
    college = COLLEGES[collegeIndex];

    dm.send("Which of these is your major?");
    switch(college){
        default:
            console.log(`shit`);
            major = "ERROR";

        case COLLEGES[0]: //cafls
            majorIndex = await choose(
                "Enter \`BACK\` to reselect your college if you don't see your major.",
                CAFLS,
                dm
            );
            major = CAFLS[majorIndex];

        case COLLEGES[1]: //caah
            majorIndex = await choose(
                "Enter \`BACK\` to reselect your college if you don't see your major.",
                CAAH,
                dm
            );
            major = CAAH[majorIndex];

        case COLLEGES[2]: //cbshs
            majorIndex = await choose(
                "Enter \`BACK\` to reselect your college if you don't see your major.",
                CBSHS,
                dm
            );
            major = CBSHS[majorIndex];

        case COLLEGES[3]: //cbus
            majorIndex = await choose(
                "Enter \`BACK\` to reselect your college if you don't see your major.",
                CBUS,
                dm
            );
            major = CBUS[majorIndex];

        case COLLEGES[4]: //cedu
            majorIndex = await choose(
                "Enter \`BACK\` to reselect your college if you don't see your major.",
                CEDU,
                dm
            );
            major = CEDU[majorIndex];
        case COLLEGES[5]: //cecas
            majorIndex = await choose(
                "Enter \`BACK\` to reselect your college if you don't see your major.",
                CECAS,
                dm
            );
            major = CECAS[majorIndex];

        case COLLEGES[6]: //csci
            majorIndex = await choose(
                "Enter \`BACK\` to reselect your college if you don't see your major.",
                CSCI,
                dm
            );
            major = CSCI[majorIndex];

        case COLLEGES[7]: //undeclared
            let confirmation = await askString(
                "Confirm Undeclared? (Y/N)",
                dm
            );
            while(!valResponses.includes(confirmation)){
                dm.send("I can't quite understand what you said. Try again, please.");
                confirmation = await askString(
                    "Confirm Undeclared? (Y/N)",
                    dm
                );
            }

            major = confirmation === "Y" ? college : "BACK";

        case COLLEGES[8]: //override
            override = true;
            major = await askString(
                "Alright, what's your major?",
                dm
            );
            major = major.toUpperCase();
    }

    return assign(major, override);
}