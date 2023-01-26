/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class LOD extends AbstractLOD implements ILOD {

    public override readonly levels: [ BABYLON.TransformNode, float ][] = [];

    public get root(): BABYLON.TransformNode {

        return this.levels[0][0];
    }

    public get position(): BABYLON.Vector3 {
        
        return this.root.position;
    }

    public get rotationQuaternion(): BABYLON.Quaternion {
        
        if ( this.root.rotationQuaternion === null ) {

            this.root.rotationQuaternion = this.root.rotation.toQuaternion();
        }

        return this.root.rotationQuaternion;
    }

    public get scaling(): BABYLON.Vector3 {
        
        return this.root.scaling;
    }
    
    public set parent( value: BABYLON.Node ) {

        for ( let i = 0; i < this.levels.length; i++ ) {

            this.levels[i][0].parent = value;
        }
    }

    private readonly doShadow?: ( currentEntity: BABYLON.TransformNode, value: boolean ) => void;
    
    public constructor( doShadow?: ( currentEntity: BABYLON.TransformNode, value: boolean ) => void ) {

        super();

        this.doShadow = doShadow;
    }

    public fromSingle( node: BABYLON.TransformNode ): void {

        this.add( node, AbstractLOD.minimum );
    }

    public fromModels( models: IModels, onEveryInstance?: ( instance: BABYLON.InstancedMesh, level: int ) => void ): void {
        
        for ( let i = 0; i < models.length; i++ ) {
            
            const model: BABYLON.TransformNode = models[i];

            if ( model instanceof BABYLON.Mesh ) {
                
                this.add( EngineAssets.getInstance().instance( model, ( instance: BABYLON.InstancedMesh ) => onEveryInstance?.( instance, i ) ), AbstractLOD.getMinimum( model.name ) );
            }
        }
    }

    public update(): void {
        
        if ( this.isEnabled === false ) {

            return;
        }

        this.coverage = Camera.getInstance().getScreenCoverage( this.root );
        this.setLevel( this.getLevelFromCoverage( this.coverage ) );
    }
    
    public override add( transformNode: BABYLON.TransformNode, min: float ): void {

        if ( this.levels.length > 0 ) {

            transformNode.position = this.position;
            transformNode.rotationQuaternion = this.rotationQuaternion;
            transformNode.scaling = this.scaling;

        } else if ( !transformNode.rotationQuaternion ) {
            
            transformNode.rotationQuaternion = transformNode.rotation.toQuaternion();
        }

        transformNode.setEnabled( false );

        super.add( transformNode, min );
    }

    protected override disposeCurrent( currentLevel: int ): void {

        this.disposeCurrentEntity( currentLevel );
        super.disposeCurrent( currentLevel );
    }

    protected override makeCurrent( level: int ): void {

        if ( level >= 0 && level < this.levels.length ) {

            super.makeCurrent( level );
            this.setupCurrentEntity( level );
        }
    }

    private disposeCurrentEntity( currentLevel: int ): void {

        this.levels[ currentLevel ][0].setEnabled( false );
        
        this.doShadow?.( this.levels[ currentLevel ][0], false );
    }

    private setupCurrentEntity( level: int ): void {

        if ( level === 0 ) {
                
            this.doShadow?.( this.levels[ level ][0], true );      
        }

        this.levels[ level ][0].setEnabled( true );
    }

}