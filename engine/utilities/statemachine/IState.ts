/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IState {

    readonly onEnter: ( oldKey: string, params: any ) => void;
    
    readonly onLeave: ( newKey: string, params: any ) => void;
    
}