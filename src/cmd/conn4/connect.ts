import {GameBoard} from "./gameboard";
import {User, DMChannel} from "discord.js";
import {askString} from "../../lib/prompt";
import {client} from "../../client";

async function getChoice(
    dm:DMChannel,
    user:User,
    board:GameBoard
):Promise<number> {
    
    dm.send(`It's your turn!\n\n${board.toString()}`);
    let choice:string = await askString(
        "Which column do you want to place your marker in?",
        dm
    );

    //this whole thing is so bad, I'm so sorry for what you're about to read
    while(
        !parseInt(choice) ||
        parseInt(choice) >= board.getCols() ||
        parseInt(choice) < 0
    ){
        if(!parseInt(choice)) dm.send("I'm sorry, that's not a column number");
        if(parseInt(choice) >= board.getCols()) {
            dm.send(
                `Column choice cannot be greater than ${board.getCols() - 1}. Please try again.`
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
    let dms:[DMChannel, DMChannel] = [
        await users[0].createDM(),
        await users[1].createDM()
    ];

    //turn counter, game board
    let turn:number = 0;
    let board:GameBoard = new GameBoard();

    while(1 == 1){

        //get current references
        let currPlayer = users[turn % 2];
        let currDM = dms[turn % 2];

        //get column choice
        let choice:number = await getChoice(currDM, currPlayer, board);

        //check to see if the column is full
        while(!board.checkIfFree(choice)){
            currDM.send(`Column ${choice} is full.`);
            choice = await getChoice(currDM, currPlayer, board);
        }

        //place the token
        if(turn % 2 == 0) board.placeToken('X', choice);
        else board.placeToken('O', choice);

        //check for a win
        if(board.checkForWin(choice)){
            currDM.send("Congrats, you won!");
            dms[(turn++) % 2].send("You lost. Better luck next time!");
            return currPlayer;
        }

        //check for a tie
        //if so, return the bot as the winner.
        if(board.checkTie()){
            currDM.send("This game is a tie.");
            dms[(turn++) % 2].send("This game is a tie.");
            return client.user;
        }

        turn++;
    }
}