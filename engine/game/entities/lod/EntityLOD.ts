/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class EntityLOD extends AbstractLOD implements IEntityLOD {

    public override readonly levels: [ IEntityManager< BABYLON.InstancedMesh >, float ][] = [];

    public readonly position: BABYLON.Vector3 = new BABYLON.Vector3();
    public readonly rotationQuaternion: BABYLON.Quaternion = new BABYLON.Quaternion();
    public readonly scaling: BABYLON.Vector3 = BABYLON.Vector3.One();

    public parent: Nullable< BABYLON.Node > = null;

    private readonly doShadow?: ( currentEntity: BABYLON.InstancedMesh, value: boolean ) => void;
    private readonly doCollidable: boolean = false;
    private readonly onRequest?: ( currentEntity: BABYLON.InstancedMesh ) => void;
    private readonly onReturn?: ( currentEntity: BABYLON.InstancedMesh ) => void;

    private currentEntity: Nullable< BABYLON.InstancedMesh > = null;

    public constructor( doShadow?: ( currentEntity: BABYLON.InstancedMesh, value: boolean ) => void, doCollidable: boolean = false, onRequest?: ( currentEntity: BABYLON.InstancedMesh ) => void, onReturn?: ( currentEntity: BABYLON.InstancedMesh ) => void ) {

        super();

        this.doShadow = doShadow;
        this.doCollidable = doCollidable;
        this.onRequest = onRequest;
        this.onReturn = onReturn;
    }

    public fromModels( models: IModels ): void {

        for ( let i: int = 0; i < models.length; i++ ) {
            
            if ( models[i].entitymanager !== undefined ) {

                this.add( models[i].entitymanager, AbstractLOD.getMinimum( models[i].name ) );
            }
        }
    }

    public setBounding( boundingCache: IBoundingCache ): void {

        this.__boundingCache = boundingCache;
    }

    public getInstance(): Nullable< BABYLON.InstancedMesh > {

        return this.currentEntity;
    }

    public update(): void {
        
        if ( this.isEnabled === false ) {

            return;
        }

        this.coverage = Camera.getInstance().getScreenCoverage( this ); //ITransformable
        this.setLevel( this.getLevelFromCoverage( this.coverage ) );
    }

    protected override disposeCurrent( currentLevel: int ): void {

        this.disposeCurrentEntity( currentLevel );
        super.disposeCurrent( currentLevel );
    }

    protected override makeCurrent( level: int ): void {

        if ( level >= 0 && level < this.levels.length ) {

            super.makeCurrent( level );

            const requestResult: Nullable< BABYLON.InstancedMesh > = this.levels[ level ][0].request();

            if ( requestResult instanceof BABYLON.InstancedMesh ) {

                this.setupCurrentEntity( requestResult, level );
            }
        }
    }

    private disposeCurrentEntity( currentLevel: int ): void {

        if ( this.currentEntity !== null ) {
                
            if ( this.doCollidable === true ) {

                PhysicsEntity.collidable( this.currentEntity, undefined, false );
            }
            
            this.onReturn?.( this.currentEntity );
            this.doShadow?.( this.currentEntity, false );

            this.currentEntity = this.levels[ currentLevel ][0].return( this.currentEntity );
        }

        this.currentEntity = null;
    }

    private setupCurrentEntity( requestResult: BABYLON.InstancedMesh, level: int ): void {

        this.currentEntity = requestResult;

        if ( this.currentEntity.rotationQuaternion === null ) {

            this.currentEntity.rotationQuaternion = this.currentEntity.rotation.toQuaternion();
        }

        this.currentEntity.position.copyFrom( this.position );
        this.currentEntity.rotationQuaternion.copyFrom( this.rotationQuaternion );
        this.currentEntity.scaling.copyFrom( this.scaling );
        this.currentEntity.parent = this.parent;

        if ( level === 0 ) {
                    
            if ( this.doCollidable === true ) {

                PhysicsEntity.collidable( this.currentEntity );
            }

            this.doShadow?.( this.currentEntity, true );     
        }

        this.onRequest?.( this.currentEntity );
    }

}