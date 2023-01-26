/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class BoundingCache implements IBoundingCache {
    
    public readonly min: BABYLON.Vector3 = new BABYLON.Vector3();
    public readonly max: BABYLON.Vector3 = new BABYLON.Vector3();

    public readonly diagonal: BABYLON.Vector3 = new BABYLON.Vector3();
    public size: float = 0.0;

    public constructor( node: BABYLON.Node ) {
    
        const boundingVectors: { min: BABYLON.Vector3; max: BABYLON.Vector3; } = node.getHierarchyBoundingVectors( true );

        this.min.copyFrom( boundingVectors.min );
        this.max.copyFrom( boundingVectors.max );
    }
    
    public update(): void {

        this.diagonal.copyFrom( this.max ).subtractInPlace( this.min );
        this.size = this.diagonal.length();
    }

}