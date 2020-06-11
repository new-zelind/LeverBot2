import verify from "../passive/verification";
import Command, { Permissions } from "../lib/command";
import { GuildMember} from "discord.js";

export default Command({
  names: ["verify"],
  documentation: {
    description: "Manually starts verification for a member.",
    group: "ADMIN",
    usage: "verify <user : @ mention>",
  },

  check: Permissions.admin,
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