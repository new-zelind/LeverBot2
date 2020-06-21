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

async function getChoice(dm:DMChannel):Promise<number> {
    
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
            dm.send("I'm sorry, that's not a column number.");
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
    resetBoard();

    while(1 == 1){

        //get current references
        let currPlayer = users[turn % 2];
        let currDM = dms[turn % 2];

        currDM.send(`**Turn ${turn+1}:**\nIt's your turn!\n${makeString()}`);

        //get column choice
        let choice:number = await getChoice(currDM);

        //check to see if the column is full
        while(!checkIfFree(choice)){
            currDM.send(`Column ${choice} is full.`);
            choice = await getChoice(currDM);
        }

        //place the token
        if(turn % 2 == 0) placeToken('X', choice);
        else placeToken('O', choice);

        //check for a win
        if(checkForWin(choice)){return currPlayer;}

        //check for a tie
        //if so, return the bot as the winner.
        if(checkTie()){
            return client.user;
        }

        currDM.send(`Your move:\n${makeString()}\nOpponent's turn.`);

        turn++;
    }
}