import{
    checkIfFree,
    checkForWin,
    placeToken,
    makeString,
    resetBoard
} from "./gameboard";
import {DMChannel, User} from "discord.js";
import {askString} from "../../lib/prompt";
import {client} from "../../client";

async function getChoice(dm:DMChannel):Promise<number> {
    let choice:string = await askString(
        "Which space do you want to place your marker in?",
        dm
    );

    while(
        parseInt(choice) == NaN ||
        parseInt(choice) >= 9 ||
        parseInt(choice) < 0
    ){
        if(parseInt(choice) == NaN){
            dm.send("I'm sorry, that's not a number.");
        }
        if(parseInt(choice) >= 9){
            dm.send("Space choice cannot be greater than 9.");
        }
        if(parseInt(choice) < 0){
            dm.send("Space choice cannot be less than 0.");
        }

        choice = await askString(
            "Which space do you want to place your marker in?",
            dm
        );
    }

    return parseInt(choice);
}

export default async function ttt(
    user1:User,
    user2:User
):Promise<User>{
    let users:[User, User] = [user1, user2];
    let dms = await Promise.all(users.map(user => user.createDM()));
    let tokens = ["X", "O️"];

    let turn:number = 0;
    resetBoard();

    while(1 == 1){
        let currPlayer:User = users[turn % 2];
        let currDM:DMChannel = dms[turn % 2];
        let currToken:string = tokens[turn % 2];

        currDM.send(`**Turn ${turn+1}/9:**\nIt's your turn!\n${makeString()}`);

        let choice:number = await getChoice(currDM);

        while(!checkIfFree(choice)){
            currDM.send(`${choice} has already been taken.`);
            choice = await getChoice(currDM);
        }

        if(turn % 2 == 0) placeToken(currToken, choice);
        else placeToken(currToken, choice);

        if(checkForWin(choice, currToken)) return currPlayer;

        turn++;
        currDM.send(`Your move:\n${makeString()}`);
        
        if(turn == 9) return client.user;
        else currDM.send("Opponent's turn.");
    }
}