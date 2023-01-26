/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface Object {

    entitymanager?: IEntityManager< any >;

}

class EntityManager< T extends BABYLON.AbstractMesh > implements IEntityManager< T > {

    private readonly free: ISmartObjectArray< T >;
    private readonly used: ISmartObjectArray< T >;

    private readonly create: () => T;
    private readonly increase: int;

    private root: BABYLON.Node;

    public constructor( name: string, create: () => T, size: int, increase: int ) {
        
        this.increase = increase;
        this.create = create;

        this.free = new SmartObjectArray< T >( size );
        this.used = new SmartObjectArray< T >( size );

        this.createRoot( name );
        this.make( size );
    }

    public request(): Nullable< T > {

        if ( this.free.size === 0 ) {

            this.make( this.increase );
        }

        return this.release( this.free.pop() );
    }

    public return( entity: T ): null {

        this.used.delete( entity );
        return this.store( entity );
    }

    private createRoot( name: string ): void {

        this.root = new BABYLON.Node( `entitymanager_${ name }`, scene );
        this.root.setEnabled( false );
    }

    private make( amount: int ): void {

        for ( let i: int = 0; i < amount; i++ ) {

            this.store( this.create() );
        }
    }

    private release( entity?: T ): Nullable< T > {
        
        if ( typeof entity === "object" ) {

            this.used.add( entity );
            scene.addMesh( entity );

            entity.parent = null;
            entity.setEnabled( true );

            return entity;
        }
        
        return null;
    }

    private store( entity: T ): null {

        entity.setEnabled( false );
        entity.parent = this.root;

        scene.removeMesh( entity );
        this.free.add( entity );

        return null;
    }
    
}