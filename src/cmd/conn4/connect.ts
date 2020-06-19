import {
    checkIfFree,
    checkTie,
    checkForWin,
    placeToken,
    makeString,
    getCols,
    resetBoard,
} from "./gameboard";
import {User, DMChannel} from "discord.js";
import {askString} from "../../lib/prompt";
import {client} from "../../client";

let board:string[][];

async function getChoice(dm:DMChannel):Promise<number> {
    
    dm.send(`It's your turn!\n${makeString(board)}`);
    let choice:string = await askString(
        "Which column do you want to place your marker in?",
        dm
    );

    //this whole thing is so bad
    while(
        parseInt(choice) == NaN ||
        parseInt(choice) >= getCols() ||
        parseInt(choice) < 0
    ){
        if(parseInt(choice) == NaN){
            dm.send("I'm sorry, that's not a column number");
        }
        if(parseInt(choice) >= getCols()) {
            dm.send(
                `Column choice cannot be greater than 6. Please try again.`
            );
        }
        if(parseInt(choice) < 0){
            dm.send(
                "Column choice cannot be less than 0. Please try again."
            );
        }
        
        choice = await askString(
            "Which column do you want to place your marker in?",
            dm
        );
    }
    return parseInt(choice);
}

export default async function connect(
    user1:User,
    user2:User
):Promise<User>{

    //create user and dm containers
    let users:[User, User] = [user1, user2];
    let dms = await Promise.all(users.map(user => user.createDM()));

    //turn counter, game board
    let turn:number = 0;
    resetBoard(board);

    while(1 == 1){

        //get current references
        let currPlayer = users[turn % 2];
        let currDM = dms[turn % 2];
        console.log("update dms");

        //get column choice
        let choice:number = await getChoice(currDM);

        //check to see if the column is full
        while(!checkIfFree(choice, board)){
            currDM.send(`Column ${choice} is full.`);
            choice = await getChoice(currDM);
        }
        console.log("free");

        //place the token
        if(turn % 2 == 0) placeToken('X', choice, board);
        else placeToken('O', choice, board);
        console.log("token placed");

        console.log(`${makeString(board)}`);

        //check for a win
        if(checkForWin(choice, board)){
            currDM.send("Congrats, you won!");
            dms[(turn++) % 2].send("You lost. Better luck next time!");
            return currPlayer;
        }
        console.log("no winner");

        //check for a tie
        //if so, return the bot as the winner.
        if(checkTie(board)){
            currDM.send("This game is a tie.");
            dms[(turn++) % 2].send("This game is a tie.");
            return client.user;
        }
        console.log("no draw");

        currDM.send("Opponent's turn.");

        turn++;
    }
}