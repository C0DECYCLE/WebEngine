/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IBoundingCache {

    readonly min: BABYLON.Vector3;

    readonly max: BABYLON.Vector3;

    readonly diagonal: BABYLON.Vector3;
    
    size: float;
    
    update(): void;

}