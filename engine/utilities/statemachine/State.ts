/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class State implements IState {

    public readonly onEnter: ( oldKey: string, params: any ) => void;
    public readonly onLeave: ( newKey: string, params: any ) => void;

    constructor( onEnter: IState[ "onEnter" ], onLeave: IState[ "onLeave" ] ) {

        this.onEnter = onEnter;
        this.onLeave = onLeave;
    }
    
}