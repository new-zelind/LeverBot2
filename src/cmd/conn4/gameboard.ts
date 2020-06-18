import {BoardPosition} from "./boardposition";

//7x7 playing board
export const board:string[][] = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
];

export function checkIfFree(c:number):boolean {

    //if top space is blank, then the column is empty
    return (board[5][c] === " ");
}

function checkHorizWin(pos:BoardPosition, p:string):boolean {
    let traverseRight:boolean = false;
    let count:number = 1;
    let currPos:BoardPosition = pos;

    while(!traverseRight){
        if(currPos.getColumn()+1 < 6){
            currPos = new BoardPosition(
                currPos.getRow(), currPos.getColumn()+1
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == 4) return true;
            } else traverseRight = true;
        } else traverseRight = true;
    }

    currPos = pos;
    while(traverseRight){
        if(currPos.getColumn() - 1 >= 0){
            currPos = new BoardPosition(
                currPos.getRow(), currPos.getColumn()-1
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == 4) return true;
            } else break;
        } else break;
    }

    return false;
}

function checkDiagWin(pos:BoardPosition, p:string):boolean {
    let count:number = 1;
    let currPos:BoardPosition = pos;

    //northwest
    while(count < 4){
        if(currPos.getRow()-1 >= 0 && currPos.getColumn()+1 < 7){
            currPos = new BoardPosition(
                (currPos.getRow()-1), (currPos.getColumn()+1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == 4) return true;
            } else break;
        } else break;
    }

    currPos = pos;

    //southeast
    while(count < 4){
        if(currPos.getRow()+1 < 6 && currPos.getColumn()-1 >= 0){
            currPos = new BoardPosition(
                (currPos.getRow()+1), (currPos.getColumn()-1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == 4) return true;
            } else break;
        } else break;
    }

    currPos = pos;
    count = 1;

    //southwest
    while(count < 4){
        if(currPos.getRow()-1 >= 0 && currPos.getColumn()-1 >= 0){
            currPos = new BoardPosition(
                (currPos.getRow()-1), (currPos.getColumn()-1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == 4) return true;
            } else break;
        } else break;
    }

    currPos = pos;

    //northeast
    while(count < 4){
        if(currPos.getRow()+1 < 6 && currPos.getColumn()+1 < 7){
            currPos = new BoardPosition(
                (currPos.getRow()+1), (currPos.getColumn()+1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == 4) return true;
            } else return false;
        } else return false;
    }

    return false;
}

function checkVertWin(pos:BoardPosition, p:string):boolean {

    let count:number = 1;
    let currPos:BoardPosition = pos;

    while(count < 4){
        if(currPos.getRow()-1 >= 0){
            currPos = new BoardPosition(
                currPos.getRow()-1, currPos.getColumn()
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == 4) return true;
            } else break;
        } else break;
    }

    return false;
}

export function checkForWin(c:number):boolean {

    //get row number of latest position
    let rowNum = 5;
    while(board[rowNum][c] === " ") rowNum--;

    //get character and generate current position
    let token:string = board[rowNum][c];
    let currPos:BoardPosition = new BoardPosition(rowNum, c);

    //check for wins
    if(checkHorizWin(currPos, token)) return true;
    if(checkVertWin(currPos, token)) return true;
    if(checkDiagWin(currPos, token)) return true;
    return false;
}

export function placeToken(p:string, c:number):void {
    if(checkIfFree(c)){
        let i=0;
        while(board[i][c] !== ' ') i++;
        board[i][c] = p;
    }
}

export function whatsAtPos(pos:BoardPosition):string {
    return board[pos.getRow()][pos.getColumn()] as string;
}

export function checkTie():boolean {
    let currPos:BoardPosition;

    for(let i=0; i<6; i++){
        currPos = new BoardPosition(7, i);
        if(whatsAtPos(currPos) === ' ') return false;
    }

    return true;
}

export function makeString():string {
    let gbString = "";
    for(let i = 0; i < 6; i++) gbString = gbString.concat("|" + i);
    gbString = gbString.concat("|\n");

    for(let r = 7-1; r >= 0; r--){
        for(let c = 0; c < 6; c++){
            gbString = gbString.concat("|" + board[r][c]);
        }
        gbString.concat("|\n");
    }

    return gbString;
}