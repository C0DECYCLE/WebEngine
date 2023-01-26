/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IAbstractLOD {

    readonly levels: [ any, float ][];

    get isEnabled(): boolean;

    get isVisible(): boolean;

    add( level: any, min: float ): void;

    setEnabled( value: boolean ): void;

    set( level: int ): void;

}