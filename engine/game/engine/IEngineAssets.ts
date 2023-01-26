/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IEngineAssets {

    cache: BABYLON.Node;

    readonly list: Map< string, BABYLON.TransformNode >;

    readonly materials: Map< string, BABYLON.StandardMaterial >;

    readonly interactableMaterials: Map< string, IPlayerInteractionMaterial >;

    readonly onLoadObservable: BABYLON.Observable< void >;
    
    load( list: [ string, string ][] ): void;
        
    traverse( importLod: BABYLON.Mesh, onEveryMesh: ( mesh: BABYLON.Mesh ) => void, interactables?: string[] ): BABYLON.Mesh;

    merge( mesh: BABYLON.Mesh ): BABYLON.Mesh;

    instance( lod: BABYLON.Mesh, onEveryInstance?: ( instance: BABYLON.InstancedMesh ) => void ): BABYLON.InstancedMesh;

    provide( name: string, onMeshTraverse: ( mesh: BABYLON.Mesh, i: int ) => void ): IModels;

}