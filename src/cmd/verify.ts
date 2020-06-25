import verify from "../passive/verification";
import Command, { Permissions } from "../lib/command";
import {GuildMember, Message} from "discord.js";
import {timeout} from "../lib/timeout";

export default Command({
  names: ["verify"],
  documentation: {
    description: "Manually starts verification for a member.",
    group: "ADMIN",
    usage: "verify <user : @ mention>",
  },

  check: Permissions.admin,

  fail(message: Message){
    timeout(
      message.member,
      message.member.guild.me,
      "5m",
      "Unauthorized use of `rm` command"
    );
    return message.channel.send("I'm sorry. I'm afraid I can't do that.");
  },
  
  exec(message) {
    message.mentions.members.forEach(
      (member: GuildMember) => {

        //manually verify a member
        verify(member);
        console.log(
          `Started manual verification for ${member.user.username}#${member.user.discriminator}`
        );
      }
    );
  },
});