import {GameBoard} from "./gameboard";
import {BoardPosition} from "./boardposition";
import {Message, TextChannel, User, DMChannel} from "discord.js";
import {askString} from "../../lib/prompt";

async function getChoice(
    dm:DMChannel,
    user:User,
    board:GameBoard
):Promise<number> {
    dm.send(`${user.toString()} it's your turn!\n\n${board.toString()}`);
    let response:string = await askString(
        "Which column do you want to place your marker in?",
        dm
    );
    while(!parseInt(response)){
        dm.send("I'm sorry, that's not a column number.")
        response = await askString(
            "Which column do you want to place your marker in?",
            dm
        );
    }
    return parseInt(response);
}