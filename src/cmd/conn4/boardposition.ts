export class BoardPosition{

    private rowNum:number;
    private colNum:number;

    public constructor(row:number, col:number){
        this.rowNum = row;
        this.colNum = col;
    }

    public getRow():number{
        return this.rowNum;
    }

    public getColumn():number{
        return this.colNum;
    }

    public equals(pos:BoardPosition):boolean{
        if(this == pos) return true;
        return ((this.rowNum == pos.rowNum) && (this.colNum == pos.rowNum));
    }

    public toString():string{
        let toReturn:string = "";
        toReturn += this.rowNum.toString();
        toReturn += ", ";
        toReturn += this.colNum.toString();
        return toReturn;
    }
}