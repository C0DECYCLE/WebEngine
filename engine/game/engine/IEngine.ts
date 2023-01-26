/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IEngine {

    canvas: HTMLCanvasElement;

    babylon: BABYLON.Engine;

    screenSize: BABYLON.Vector2;

    readonly stats: Stats[];
    
    get deltaCorrection(): float;

    set( update: TEmptyCallback, renderScene: BABYLON.Scene ): void;

}