import Command, {Permissions} from "../lib/command";

export default Command({
    names: ["map"],
    documentation:{
        description: "A link to the interactive campus map.",
        group: "GENERAL",
        usage: "map"
    },

    check: Permissions.all,

    async exec(message){
        //interactive campus map
        message.channel.send("www.clemson.edu/campus-map");
    }
})