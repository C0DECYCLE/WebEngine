/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class Sync implements ISync {

    private length: int;
    private hasFired: boolean = false;
    private callback: TEmptyCallback;

    constructor( length: int = 0, callback: TEmptyCallback = (): void => {} ) {
        
        this.length = length;
        this.callback = callback;

        this.test();
    }

    public next(): void {

        if ( this.hasFired === true ) {

            console.error( "Sync: Has already been executed." );
            return;
        }

        this.length--;
        this.test();
    }

    private test(): void {

        if ( this.length <= 0 ) {

            this.callback();
            this.hasFired = true;
        }
    }

}