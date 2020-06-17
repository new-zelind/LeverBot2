import {BoardPosition} from "./boardposition";

export class GameBoard{

    private rows = 7;
    private cols = 6;
    private numToWin:number;
    private board:string[][] = [[],[]];

    public constructor(){    
        /*for(let i=0; i<this.rows; i++){
            for(let j=0; j<this.rows; j++){
                this.board[i][j] = " ";
            }
        }*/
        this.board = [...Array(6)].map(() => Array(7).fill(' '));
    }

    public getRows():number {return this.rows;}

    public getCols():number {return this.cols;}

    public getNumToWin():number {return this.numToWin;}

    public checkIfFree(c:number):boolean {

        //if top space is blank, then the column is empty
        return (this.board[this.rows-1][c] === ' ');
    }

    public checkForWin(c:number):boolean {

        //get row number of latest position
        let rowNum = this.rows - 1;
        while(this.board[rowNum][c] === ' ') rowNum--;

        //get character and generate current position
        let token:string = this.board[rowNum][c];
        let currPos:BoardPosition = new BoardPosition(rowNum, c);

        //check for wins
        if(this.checkHorizWin(currPos, token)) return true;
        if(this.checkVertWin(currPos, token)) return true;
        if(this.checkDiagWin(currPos, token)) return true;
        return false;
    }

    public placeToken(p:string, c:number):void {
        if(this.checkIfFree(c)){
            let i=0;
            while(this.board[i][c] !== ' ') i++;
            this.board[i][c] = p;
        }
    }

    public checkHorizWin(pos:BoardPosition, p:string):boolean {
        let traverseRight:boolean = false;
        let count:number = 1;
        let currPos:BoardPosition = pos;

        while(!traverseRight){
            if(currPos.getColumn()+1 < this.cols){
                currPos = new BoardPosition(
                    currPos.getRow(), currPos.getColumn()+1
                );

                if(this.whatsAtPos(currPos) === p){
                    count++;
                    if(count == this.numToWin) return true;
                } else traverseRight = true;
            } else traverseRight = true;
        }

        currPos = pos;
        while(traverseRight){
            if(currPos.getColumn() - 1 >= 0){
                currPos = new BoardPosition(
                    currPos.getRow(), currPos.getColumn()-1
                );

                if(this.whatsAtPos(currPos) === p){
                    count++;
                    if(count == this.numToWin) return true;
                } else break;
            } else break;
        }

        return false;
    }

    public checkDiagWin(pos:BoardPosition, p:string):boolean {
        let count:number = 1;
        let currPos:BoardPosition = pos;

        //northwest
        while(count < this.numToWin){
            if(currPos.getRow()-1 >= 0 && currPos.getColumn()+1 < this.cols){
                currPos = new BoardPosition(
                    (currPos.getRow()-1), (currPos.getColumn()+1)
                );

                if(this.whatsAtPos(currPos) === p){
                    count++;
                    if(count == this.numToWin) return true;
                } else break;
            } else break;
        }

        currPos = pos;

        //southeast
        while(count < this.numToWin){
            if(currPos.getRow()+1 < this.rows && currPos.getColumn()-1 >= 0){
                currPos = new BoardPosition(
                    (currPos.getRow()+1), (currPos.getColumn()-1)
                );

                if(this.whatsAtPos(currPos) === p){
                    count++;
                    if(count == this.numToWin) return true;
                } else break;
            } else break;
        }

        currPos = pos;
        count = 1;

        //southwest
        while(count < this.numToWin){
            if(currPos.getRow()-1 >= 0 && currPos.getColumn()-1 >= 0){
                currPos = new BoardPosition(
                    (currPos.getRow()-1), (currPos.getColumn()-1)
                );

                if(this.whatsAtPos(currPos) === p){
                    count++;
                    if(count == this.numToWin) return true;
                } else break;
            } else break;
        }

        currPos = pos;

        //northeast
        while(count < this.numToWin){
            if(
                currPos.getRow()+1 < this.rows &&
                currPos.getColumn()+1 < this.cols
            ){
                currPos = new BoardPosition(
                    (currPos.getRow()+1), (currPos.getColumn()+1)
                );

                if(this.whatsAtPos(currPos) === p){
                    count++;
                    if(count == this.numToWin) return true;
                } else return false;
            } else return false;
        }

        return false;
    }

    public checkVertWin(pos:BoardPosition, p:string):boolean {
        let count:number = 1;
        let currPos:BoardPosition = pos;

        while(count < this.numToWin){
            if(currPos.getRow()-1 >= 0){
                currPos = new BoardPosition(
                    currPos.getRow()-1, currPos.getColumn()
                );

                if(this.whatsAtPos(currPos) === p){
                    count++;
                    if(count == this.numToWin) return true;
                } else break;
            } else break;
        }

        return false;
    }

    public whatsAtPos(pos:BoardPosition):string {
        return this.board[pos.getRow()][pos.getColumn()] as string;
    }

    public checkTie():boolean {
        let currPos:BoardPosition;

        for(let i=0; i<this.cols; i++){
            currPos = new BoardPosition(this.rows, i);
            if(this.whatsAtPos(currPos) === ' ') return false;
        }

        return true;
    }

    public toString():string {
        let gbString = "";
        for(let i = 0; i < this.cols; i++) gbString = gbString.concat("|" + i);
        gbString = gbString.concat("|\n");

        for(let r = this.rows-1; r >= 0; r--){
            for(let c = 0; c < this.cols; c++){
                gbString = gbString.concat("|" + this.board[r][c]);
            }
            gbString.concat("|\n");
        }

        return gbString;
    }
}