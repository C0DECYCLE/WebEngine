/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface ILOD extends IAbstractLOD {

    readonly levels: [ BABYLON.TransformNode, float ][];

    get root(): BABYLON.TransformNode;

    get position(): BABYLON.Vector3,

    get rotationQuaternion(): BABYLON.Quaternion;

    get scaling(): BABYLON.Vector3;
    
    set parent( value: BABYLON.Node );

    fromSingle( node: BABYLON.TransformNode ): void;

    fromModels( models: IModels, onEveryInstance?: ( instance: BABYLON.InstancedMesh, level: int ) => void ): void;

    update(): void;
    
    add( transformNode: BABYLON.TransformNode, min: float ): void;

}