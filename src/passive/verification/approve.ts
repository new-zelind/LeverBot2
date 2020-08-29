import {
    GuildMember,
    MessageEmbed,
    TextChannel,
    Message,
    User,
    MessageReaction,
    PartialGuildMember,
    ReactionCollector
} from "discord.js";

/**
 * A function to handle the approval or denial of a new member
 * @param member an instance of the new member awaiting approval
 * @param name the member's name
 * @param room the member's room assignment
 * @param cuid the member's cuid
 * @param roles the requested roles, as determined by the verification process
 * @param override if the user requested an override
 * @param reason the reason for an override, if needed
 */
export default async function approve(
    member: GuildMember | PartialGuildMember,
    name: string,
    room: string,
    cuid: string,
    roles: string[],
    override: boolean,
    reason: string
): Promise<boolean> {

    //create a new embed to hold the verification info
    //includes username, avatar, first name, requested roles, room number, cuid
    const embed:MessageEmbed = new MessageEmbed()
        .setAuthor(member.user.username, member.user.avatarURL() ?? undefined)
        .setTitle(`Verification for ${name}`)
        .setDescription(
            `Requested Roles: ${roles
                .map((role) => member.guild.roles.cache.get(role)?.toString())
                .join(", ")}`
        )
        .addField("Room:", room)
        .addField("CUID:", cuid)
        .setTimestamp();

    //if an override was requested, add the reason for the override
    if(override) embed.addField("OVERRIDE:", reason);

    //find the member approval channel
    const channel = member.guild.channels.cache.find(
        (channel) => channel.name === "member-approval"
    ) as TextChannel;

    //send the embed and give the thumbs up and thumbs down options
    const approval = (await channel.send(embed)) as Message;
    await Promise.all([approval.react("👍"), approval.react("👎")]);


    return new Promise((resolve, reject) => {

        //create a collector to get the admin's decision
        let collector:ReactionCollector = approval.createReactionCollector(
            (vote, usr: User) =>
             (vote.emoji.name === "👎" || vote.emoji.name === "👍") && !usr.bot
        );

        let handleReaction: (vote: MessageReaction) => void;
        collector.on("collect", (handleReaction = (vote) => {
            const approver:User = vote.users.cache.last();
            if(!approver) return;

            //if approved, add the requested roles to the user.
            if(vote.emoji.name === "👍"){
                member.roles.add(roles, "Verification: Roles");

                approval.edit(
                    embed.addField("Outcome", `Approved by ${approver.toString()}`)
                );

                if(collector.off){
                    collector.off("collect", handleReaction);
                }
                resolve(true);
            }

            //otherwise, deny and kick the member.
            else{
                approval.edit(
                    embed.addField(
                        "Outcome", `Denied and kicked by ${approver.toString()}`
                    )
                );
            }

            collector.emit("end");
            approval.reactions.removeAll();
            resolve(false);
            })
        );

        collector.on("end", () => {});
    }) as Promise<boolean>;
}