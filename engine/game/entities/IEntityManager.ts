/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface IEntityManager< T extends BABYLON.AbstractMesh > {

    request(): Nullable< T >;

    return( entity: T ): null;

}