import {BoardPosition} from "./boardposition";
import {code} from "../../lib/util";

const rows:number = 6;
const cols:number = 7;
const numToWin:number = 4;

var board:string[][];

export function getCols():number {return cols;}

export function resetBoard():void {
    /*for(let i = 0; i<rows; i++){
        board[i] = new Array<string>();
        for(let j=0; j<cols; j++){
            board[i].push(" ");
        }
    }*/
    board = [...Array(rows)].map(a => Array(cols).fill(" "));
}

export function checkIfFree(c:number):boolean {
    if(board[rows-1][c] === " ") return true;
    return false;
}

function checkHorizWin(pos:BoardPosition, p:string):boolean {
    let traverseRight:boolean = false;
    let count:number = 1;
    let currPos:BoardPosition = pos;

    while(!traverseRight){
        if(currPos.getColumn()+1 < cols){
            currPos = new BoardPosition(
                currPos.getRow(), currPos.getColumn()+1
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == numToWin) return true;
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
                if(count == numToWin) return true;
            } else break;
        } else break;
    }

    return false;
}

function checkDiagWin(pos:BoardPosition, p:string):boolean {
    let count:number = 1;
    let currPos:BoardPosition = pos;

    //northwest
    while(count < numToWin){
        if(currPos.getRow()-1 >= 0 && currPos.getColumn()+1 < cols){
            currPos = new BoardPosition(
                (currPos.getRow()-1), (currPos.getColumn()+1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == numToWin) return true;
            } else break;
        } else break;
    }

    currPos = pos;

    //southeast
    while(count < numToWin){
        if(currPos.getRow()+1 < rows && currPos.getColumn()-1 >= 0){
            currPos = new BoardPosition(
                (currPos.getRow()+1), (currPos.getColumn()-1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == numToWin) return true;
            } else break;
        } else break;
    }

    currPos = pos;
    count = 1;

    //southwest
    while(count < numToWin){
        if(currPos.getRow()-1 >= 0 && currPos.getColumn()-1 >= 0){
            currPos = new BoardPosition(
                (currPos.getRow()-1), (currPos.getColumn()-1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == numToWin) return true;
            } else break;
        } else break;
    }

    currPos = pos;

    //northeast
    while(count < numToWin){
        if(currPos.getRow()+1 < rows && currPos.getColumn()+1 < cols){
            currPos = new BoardPosition(
                (currPos.getRow()+1), (currPos.getColumn()+1)
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == numToWin) return true;
            } else return false;
        } else return false;
    }

    return false;
}

function checkVertWin(pos:BoardPosition, p:string):boolean {

    let count:number = 1;
    let currPos:BoardPosition = pos;

    while(count < numToWin){
        if(currPos.getRow()-1 >= 0){
            currPos = new BoardPosition(
                currPos.getRow()-1, currPos.getColumn()
            );

            if(whatsAtPos(currPos) === p){
                count++;
                if(count == numToWin) return true;
            } else break;
        } else break;
    }

    return false;
}

export function checkForWin(c:number):boolean {

    //get row number of latest position
    let rowNum = rows-1;
    let lastPos:BoardPosition = new BoardPosition(rowNum, c);
    while(whatsAtPos(lastPos) === " "){
        //console.log(`${lastPos.toString()} \"${whatsAtPos(lastPos)}\"`);
        if(rowNum == 0) break;
        rowNum--;
        lastPos = new BoardPosition(rowNum, c);
    }

    //get character and generate current position
    let token:string = whatsAtPos(lastPos);
    console.log(token);

    //check for wins
    if(checkHorizWin(lastPos, token)) return true;
    console.log("h");
    if(checkVertWin(lastPos, token)) return true;
    console.log("v");
    if(checkDiagWin(lastPos, token)) return true;
    console.log("d");
    return false;
}

export function placeToken(p:string, c:number):void {
    if(checkIfFree(c)){
        let i = 0;
        while(board[i][c] !== " ") i++;
        board[i][c] = p;
    }
}

export function whatsAtPos(pos:BoardPosition):string {
    return board[pos.getRow()][pos.getColumn()];
}

export function checkTie():boolean {
    let currPos:BoardPosition;

    for(let i=0; i<rows; i++){
        for(let j=0; j<rows; j++){
            currPos = new BoardPosition(i, j);
            if(whatsAtPos(currPos) === " ") return false;
        }
    }

    return true;
}

export function makeString():string {
    let gbString = "";
    for(let i = 0; i < cols; i++) gbString = gbString.concat("|" + i);
    gbString = gbString.concat("|\n");

    let pos:BoardPosition;
    for(let r = rows; r >= 0; r--){
        for(let c = 0; c < cols; c++){
            pos = new BoardPosition(r, c);
            gbString = gbString.concat(`|${whatsAtPos(pos)}`);
        }
        gbString = gbString.concat("|\n");
    }
    gbString = gbString.concat("\n");

    return code(gbString);
}