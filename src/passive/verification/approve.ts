import {
    GuildMember,
    MessageEmbed,
    TextChannel,
    Message,
    User,
    MessageReaction,
    PartialGuildMember
} from "discord.js";

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
    const embed = new MessageEmbed()
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
        let collector = approval.createReactionCollector(
            (vote, usr: User) =>
             (vote.emoji.name === "👎" || vote.emoji.name === "👍") && !usr.bot
        );

        let handleReaction: (vote: MessageReaction) => void;
        collector.on("collect", (handleReaction = (vote) => {
            const approver = vote.users.cache.last();
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
                member.kick("Verification denied. Please try again.");
            }

            collector.emit("end");
            approval.reactions.removeAll();
            resolve(false);
            })
        );

        collector.on("end", () => {});
    }) as Promise<boolean>;
}