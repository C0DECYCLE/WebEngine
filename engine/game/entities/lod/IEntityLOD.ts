/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IEntityLOD extends IAbstractLOD {

    readonly levels: [ IEntityManager< BABYLON.InstancedMesh >, float ][];

    readonly position: BABYLON.Vector3;

    readonly rotationQuaternion: BABYLON.Quaternion;

    readonly scaling: BABYLON.Vector3;

    parent: Nullable< BABYLON.Node >;

    fromModels( models: IModels ): void;

    setBounding( boundingCache: IBoundingCache ): void;

    getInstance(): Nullable< BABYLON.InstancedMesh >;

    update(): void;

}