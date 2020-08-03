import Command, {Permissions} from "../lib/command";

export default Command({
    names: ["bubblewrap"],
    documentation:{
        description: "Pop pop pop!",
        group: "GAMES",
        usage: "bubblewrap"
    },
    check: Permissions.all,

    async exec(message){
        let msg:String = "";
        for(var i = 1; i <= 5; i++){
            for(var j = 1; j <= 10; j++){
                msg = msg.concat("||pop!|| ");
            }
            msg = msg.concat('\n');
        }

        return message.channel.send(msg);
    }
})