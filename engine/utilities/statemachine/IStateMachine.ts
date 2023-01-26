/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IStateMachine {

    get current(): string;

    add( key: string, onEnter: IState[ "onEnter" ], onLeave: IState[ "onLeave" ] ): void;

    set( key: string, params?: any ): void;
    
    is( key: string ): boolean;
    
}