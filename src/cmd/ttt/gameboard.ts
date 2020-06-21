import {code} from "../../lib/util";

var board:string[] = new Array<string>();

function checkDiagWin(p:string):boolean{
    //only two possible diagonals
    if(
        board[0] === p &&
        board[4] === p &&
        board[8] === p
    ) return true;
    else if(
        board[2] === p &&
        board[4] === p &&
        board[6] === p
    ) return true;
    else return false;
}

function checkHorizWin(index:number, p:string):boolean{
    let count:number = 1;
    let currIndex:number = index;

    while(count < 3){
        if(((currIndex-1) % 3) < 2){
            currIndex -= 1;

            if(board[currIndex] === p){
                count++;
                if(count == 3) return true;
            } else break;
        } else break;
    }

    currIndex = index;

    while(count < 3){
        if(((currIndex+1) % 3) > 0){
            currIndex += 1;

            if(board[currIndex] === p){
                count++;
                if(count == 3) return true;
            } else break;
        } else break;
    }

    return false;
}

function checkVertWin(index:number, p:string):boolean{
    let count:number = 1;
    let currIndex:number = index;

    while(count < 3){
        if(currIndex - 3 >= 0){
            currIndex -= 3;

            if(board[currIndex] === p){
                count++;
                if(count == 3) return true;
            } else break;
        } else break;
    }

    currIndex = index;

    while(count < 3){
        if(currIndex + 3 >= 8){
            currIndex += 3

            if(board[currIndex] === p){
                count++;
                if(count == 3) return true;
            } else break;
        } else break;
    }

    return false;
}

export function resetBoard():void {
    for(let i=0; i<9; i++) board.push(`${i}`);
}

export function checkIfFree(i:number):boolean {
    if(board[i] === "X" || board[i] === "O") return false;
    return true;
}

export function checkForWin(index:number, p:string):boolean {
    if(index % 2 == 0){
        if(checkDiagWin(p)) return true;
    }
    if(checkHorizWin(index, p)) return true;
    if(checkVertWin(index, p)) return true;
    return false;
}

export function placeToken(p:string, i:number):void {
    board[i] = p;
}

export function whatsAtPos(i:number):string {
    return board[i];
}

export function makeString():string {
    let gbString = "\n+---+---+---+\n|";
    for(let i=0; i<3; i++){
        gbString = gbString.concat(` ${board[i]} |`);
    }
    gbString = gbString.concat("\n+---+---+---+\n|");
    for(let i=3; i<6; i++){
        gbString = gbString.concat(` ${board[i]} |`);
    }
    gbString = gbString.concat("\n+---+---+---+\n|");
    for(let i=6; i<9; i++){
        gbString = gbString.concat(` ${board[i]} |`);
    }
    gbString = gbString.concat("\n+---+---+---+");

    return code(gbString);
}