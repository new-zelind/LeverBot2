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

async function verifyChoice(
    dm:DMChannel,
    choice:number,
    board:GameBoard,
    user:User
){
    while(choice >= board.getCols() || choice < 0){
        if(choice >= board.getCols()){
            dm.send(
                `Column choice cannot be greater than ${board.getCols()-1}. Please try again.`
            );
        }
        else{
            dm.send(
                `Column choice cannot be less than 0. Please try again.`
            );
        }

        choice = await getChoice(dm, user, board);
    }
}

export default async function connect(
    user1:User,
    user2:User
){
    let users:[User, User] = [user1, user2];
    let dms:[DMChannel, DMChannel] = [
        await users[0].createDM(),
        await users[1].createDM()
    ];
    let turn:number = 0;
    let board:GameBoard = new GameBoard(7, 6, 4);
    let gameWinner:boolean = false;

    while(!gameWinner){

        //get current references
        let currPlayer = users[turn % 2];
        let currDM = dms[turn % 2];

        //get column choice
        let choice:number = await getChoice(currDM, currPlayer, board);
        await verifyChoice(currDM, choice, board, currPlayer);

        //check to see if the column is full
        while(!board.checkIfFree(choice)){
            currDM.send(`Column ${choice} is full.`);
            choice = await getChoice(currDM, currPlayer, board);
            await verifyChoice(currDM, choice, board, currPlayer);
        }

        //place the token
        if(turn % 2 == 0) board.placeToken('X', choice);
        else board.placeToken('O', choice);

        if(board.checkForWin(choice)){
            currDM.send("Congrats, you won!");
            dms[(turn++) % 2].send("You lost. Better luck next time!");
            gameWinner = true;
        }

        if(board.checkTie()){
            currDM.send("This game is a tie.");
            dms[(turn++) % 2].send("This game is a tie.");
        }

        turn++;
    }
}