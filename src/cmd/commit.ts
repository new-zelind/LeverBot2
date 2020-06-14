import Command, {Permissions} from "../lib/command";
import {getLastCommit, Commit} from "git-last-commit";
import {Message} from "discord.js";
import {code} from "../lib/util";

const getCommit = () => 
    new Promise<Commit>((res, rej) => {
        getLastCommit((err, commit) => (err ? rej(err) : res(commit)));
    });

export default Command({
    names:["commit"],
    documentation:{
        description: "View the current commit of ByrnesBot",
        group: "DEV",
        usage: "commit"
    },

    check: Permissions.owner,
    async exec(message: Message){
        const cmt = await getCommit();
        return message.channel.send(
            code(`HASH    | ${cmt.hash}\nBRANCH  | ${cmt.branch}\nSUBJECT | ${cmt.subject}`)
        );
    }
});