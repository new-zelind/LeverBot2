import Command, {Permissions} from "../lib/command";
import {Message} from "discord.js";
import {code} from "../lib/util";

const trivia:string[] = [
    `Before being dubbed "The Palmetto State", South Carolina was known as "The Iodine State" due to it's large production of Iodized Salt.`,
    `Vanna White, the co-host of Wheel of Fortune, was born in North Myrtle Beach, SC.`,
    `The largest suspension bridge in North America is the Arthur J. Ravenel, Jr. bridge, which connects Charleston and Mount Pleasant.`,
    `There are ancient sand dunes everywhere in central SC, which denotes the location of the coastline over 20 million years ago.`,
    `It is illegal to swear in public in Myrtle Beach, SC.`,
    
    `Despite Georgia being called "The Peach State", South Carolina actually produces more peaches per capita every year.`,
    `Stephen Colbert, the host of "The Late Show with Stephen Colbert", grew up on James Island, SC.`,
    `The legendary pirate captain Blackbeard was infamous for terrorizing South Carolinian colonial port cities. He was also executed in Charleston.`,
    `Charleston, SC, is considered one of the most haunted cities in the world.`,
    `There are about 3,500 Rhesus Monkeys that live on Morgan Island, SC.`,
    
    `The Doolittle Raiders, the famous WWII bombing squadron, practiced their bombing techniques by dropping bags of flour and empty shells on wooden targets on an island in the middle of Lake Murray. Remnants of the targets, bomb casings, and flour sacks are still present on Bomb Island.`,
    `The world's hottest pepper, the Carolina Reaper, was engineered by Ed Currie of Fort Mill, SC. It registers at over 1.641 million Scoville Units, and people who eat one often vomit, have spasms, and pass out.`,
    `The first game of golf played in North America was on Seabrook Island in 1786. To this day, Seabrook Island is a destination for professional golfers around the world.`,
    `Behind Christianity, the Baha'i faith is SC's largest religious group.`,
    `There is a town in SC called officially named Frog Level. However, the residents of the town jokingly call it "Prosperity" since "Frog Level doesn't sound very appealing." (quote: Zach's uncle) This has worked so well that even Google and Apple Maps have it labeled as Prosperity.`,
    
    `In 1958, the US Government accidentally dropped a Nuclear Bomb on Mars Bluff, SC. The blast created a hole 75 feet wide and 30 feet deep, and miraculously killed nobody.`,
    `The oldest living organism this side of the Mississippi is the Angel Oak located on John's Island. It's estimated to be over 500 years old, and has a shady area of over 17,000 square feet.`,
    `There's a strange sculpture by the road leading to Edisto Island, known as the "Mystery Tree". It's not a tree, but a collection of strange items hanging from a dead log. You can find flip-flops, chairs, necklaces, bottles, and even magazines hanging on it. Nobody knows who put them there.`,
    `In 2005, two trains collided in Graniteville, SC. One of the trains released over 60 tons of Chlorine gas and exposed over 5,000 residents to deadly levels of Chlorine.`,
    `Darlington Raceway in Darlington, SC is famous for it's infamously difficult egg-shaped layout. This was due to the original landowner requesting that his millpond not be disturbed during the construction of the track; construction crews had to readjust the turns appropriately.`,
    
    `There's a snack distributer in Columbia called Cromer's that has the slogan "Guaranteed Worst in Town."`,
    `SC has some weird town names: Effing, Due West, Frog Level, Aynor, and Welcome, to name a few.`,
    `There's legends of a Lizard Man roaming Scape Ore Swamp in Lee County.`,
    `It's illegal to fish with a Yo-Yo on Lake Marion.`,
    `Mount Pleasant is the only place where Sweetgrass Baskets are still produced in the US.`,
    
    `Former SC Governor and US Ambassador to the United Nations Nikki Hayley is a graduate of Clemson ('94) and an avid Tiger Football fan.`,
    `If you ever go fishing in Lake Harwell - don't eat your catch. Due to an accident over 60 years ago at an electric plant upstream, the lake is highly contaminated with PCBs, an extremely volatile carcinogen.`,
    `The first African American student to attend Clemson University was Harvey Gantt, who enrolled in January 1963. Harvey, to this day, owns a successful architecture firm in Charlotte, NC.`,
    `Clemson A&M College was founded in 1889 as an all-male Military and Agricultural college. However, the curriculum expanded over time, and Clemson College became Clemson Univerisy in 1964.`,
    `Clemson Football's famous stadium entrance was been dubbed 'The Most Exciting 25 Seconds in College Football" my esteemed sports broadcaster Brent Musburger in 1985. It is still regarded as such today, with many non-Tiger fans making their way to the stadium just to experience it in person.`,
    
    `Clemson University opened in 1893 with a class of 446 students and 15 faculty.`,
    `In 1917, shortly after the US entered World War I, the entire senior class enlisted in the armed forces.`,
    `IPTAY, Clemson's athletic booster club, stands for "I Pay Ten A Year", a nod to the annual $10 membership fee when it was founded in 1934.`,
    `The legendary football coach John W. Heisman coached Clemson Football from 1900-1903, picking up Clemson's first three conference titles.`,
    `Clemson Football has 3 NCAA National Championships - one with Danny Ford in 1981, and two with Dabo Swinney in 2016 and 2018.`,
    
    `Clemson University owns and maintains parts of one of the largest and most powerful Supercomputers in the world - the Palmetto Cluster.`,
    `The Centennial Oak, located just outside of Newman Hall, is over 100 years old and the largest Bur Oak tree in the state.`,
    `Never draw or display the Tiger Paw standing straight up and down - it must be tilted to one o'clock.`,
    `There is a "graveyard" outside of the Reeves Football Complex, beyond Death Valley on the west side of campus. Each tombstone holds the name of a Top-25 team that Clemson has beaten.`,
    `If you ever get the chance, go to The ESSO Club for lunch and get a Meat 'n' Three. The restaurant and bar used to be a gas station, and has since become an icon of the school itself.`,
    
    `Every friday is Solid Orange Friday. There is no punishment for not doing so, but you may catch a judgmental look from a fellow student or professor.`,
    `Two of the most popular superstitions at Clemson are:\n\t1. Never read the plaque on the Thomas Clemson statue in front of Old Main, and\n\t2. Never enter the John C. Calhoun house as a freshman.\nDo either of those, and you won't graduate.`,
    `The Clemson Ring is a highly prestigious tradition for Clemson Students. The ring, typically made of gold and emngraved onyx, is an ornate piece of jewelry displaying the University's land-grant and military heritage, the SC state seal, the school's motto "Who shall separate us now?", and the famous "C" on the top.`,
    `Howard's Rock, named for legendary Clemson Football coach Frank Howard, was brough to Clemson from Death Valley, CA in the 1960s. It is a tradition for all players entering the field to rub the rock for good luck, a tradition dating back to coach Howard telling his players, "If you're not going to give 110%, then keep your filthy hands off my rock."`,
    `The song "Tiger Rag", originally written by _The Orignal Dixieland Jazz Band_ in 1917, became Clemson's official fight song after former Band Director Dean Ross purchased the music in a store in Atlanta, GA in the 1940's. Now, the band has over 25 ways to play the famous fight song.`,
    
    `At the very top of Old Main is The Carillon, one of the largest instruments in North America. It is a playable instrument consisting of 47 bronze bells, ranging from the 2,800 lb D#3 bell all the way up to the 3.6 lb E6 bell. And yes, you can take a class to learn how to play! (MUSC 3250)`,
    `Clemson's colors were not always orange and Regalia - in fact, they were red and blue. The color change occurred in 1896 when coach Walter Riggs founded the Clemson Football program.`,
    `There are six metal paper airplanes scattered around campus for students to find.`,
    `The '55 Exchange, an ice cream shop located in the Hendrix Center, sells ice cream made by Clemson students in Newman Hall.`,
    `Clemson University has been growing blue cheese since 1941. For a period of time, the cheese was grown inside the Stumphouse Tunnel, an abandoned Civil War-era railway tunnel located just north of Walhalla. Now, the cheese is grown on-campus in a facility that replicates the conditions of the tunnel.`
];

export default Command({
    names: ["trivia"],
    documentation:{
        description: "Learn a random fact about South Carolina or Clemson University.",
        group: "GENERAL",
        usage: "trivia"
    },

    check: Permissions.all,

    async exec(message: Message){
        let fact = code(`${trivia[Math.floor(Math.random() * (trivia.length - 1))]}`);
        return message.channel.send(fact);
    }
});