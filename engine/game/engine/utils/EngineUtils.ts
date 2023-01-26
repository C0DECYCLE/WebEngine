/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

interface Object {

    __boundingCache?: IBoundingCache;

    min?: float;
    
    max?: float;

    biggest?: float;

    ambientCache?: [ string, float ];

}

class EngineUtils implements IEngineUtils {

    public static readonly toAngle: float = 180 / Math.PI;
    public static readonly toRadian: float = Math.PI / 180;

    public static getDeltaCorrection( delta: float, fpsTarget: int ): float {

        return delta * fpsTarget / 1000;
    }

    public static configure( self: IConfigurable, inject?: IConfig ): void {

        if ( inject !== undefined ) {

            const keys: string[] = Object.keys( self.config );
    
            for ( let i: int = 0; i < keys.length; i++ ) {
    
                const key: string = keys[i];
                const value: any = inject[ key ];
    
                if ( value !== undefined ) {
    
                    self.config[ key ] = value;
                }
            }
        }
        
        if ( self.__config === undefined ) {

            self.__config = self.config;
            
        } else {

            self.config = Object.assign( self.__config, self.config );
        }
    }

    public static getFarAway(): BABYLON.Vector3 {

        return new BABYLON.Vector3( 0, 1000 * 1000 * 1000, 0 );
    }

    public static createBoundingCache( transformNode: BABYLON.TransformNode, scaling?: BABYLON.Vector3 ): IBoundingCache {
    
        const positionWorld: BABYLON.Vector3 = EngineUtils.getWorldPosition( transformNode );
        const boundingCache: IBoundingCache = new BoundingCache( transformNode );

        boundingCache.min.subtractInPlace( positionWorld );
        boundingCache.max.subtractInPlace( positionWorld );

        if ( scaling instanceof BABYLON.Vector3 ) {

            boundingCache.min.multiplyInPlace( scaling );
            boundingCache.max.multiplyInPlace( scaling );
        }

        boundingCache.update();

        return boundingCache;
    }

    public static getBounding( transformNode: BABYLON.TransformNode, force: boolean = false ): IBoundingCache {
        
        if ( transformNode.__boundingCache === undefined || force === true ) {
            
            transformNode.__boundingCache = EngineUtils.createBoundingCache( transformNode );
        }

        return transformNode.__boundingCache;
    }

    public static getBoundingSize( transformNode: BABYLON.TransformNode, force: boolean = false ): float {

        return EngineUtils.getBounding( transformNode, force ).size;
    }

    public static getWorldPosition( transformNode: BABYLON.TransformNode ): BABYLON.Vector3 {
    
        const position: BABYLON.Vector3 = transformNode.position.clone();
        
        EngineUtils.recurseParentsPosition( position, transformNode );
        
        return position;
    }

    private static recurseParentsPosition( result: BABYLON.Vector3, transformNode: BABYLON.TransformNode ): void {

        if ( transformNode.parent === null || !( transformNode.parent instanceof BABYLON.TransformNode ) ) {

            return;
        }

        if ( !transformNode.parent.scaling || !transformNode.parent.rotationQuaternion || !transformNode.parent.position ) {

            return;
        }
        
        result.multiplyInPlace( transformNode.parent.scaling )
        .applyRotationQuaternionInPlace( transformNode.parent.rotationQuaternion )
        .addInPlace( transformNode.parent.position );

        EngineUtils.recurseParentsPosition( result, transformNode.parent );
    }

    public static makeSceneAmbient( hexColor: string, intensity: float ): BABYLON.Color3 {

        const ambientColor: BABYLON.Color3 = new BABYLON.Color3( 1, 1, 1 );
        ambientColor.ambientCache = [ hexColor, intensity ];
        
        return ambientColor;
    }

    public static makeDebugMaterial( hexColor: string ): BABYLON.StandardMaterial {
    
        const debugMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial( `debug_${ hexColor }`, scene );
        EngineExtensions.setStandardMaterialColorIntensity( debugMaterial, hexColor, 1.0 );
        debugMaterial.wireframe = true;
        debugMaterial.freeze();

        return debugMaterial;
    }

    public static setTransformNodeDirection( transformNode: BABYLON.TransformNode, forward?: BABYLON.Vector3, up?: BABYLON.Vector3, lerp: float = 1.0 ): void {
    
        if ( transformNode.rotationQuaternion === null ) {

            transformNode.rotationQuaternion = transformNode.rotation.toQuaternion();
        }

        const direction: BABYLON.Quaternion = BABYLON.Quaternion.FromLookDirectionRH( forward || transformNode.forward, up || transformNode.up );

        transformNode.rotationQuaternion.copyFrom( lerp === 1.0 ? direction : BABYLON.Quaternion.Slerp( transformNode.rotationQuaternion, direction, lerp ) );
    }

    public static setDirection( rotationQuaternion: BABYLON.Quaternion, forward: BABYLON.Vector3, yawCor: float = 0.0, pitchCor: float = 0.0, rollCor: float = 0.0 ): void {
    
        const yaw: float = -Math.atan2( forward.z, forward.x ) + Math.PI / 2;
        const len: float = Math.sqrt( forward.x * forward.x + forward.z * forward.z );
        const pitch: float = -Math.atan2( forward.y, len );
        
        BABYLON.Quaternion.RotationYawPitchRollToRef( yaw + yawCor, pitch + pitchCor, rollCor, rotationQuaternion );
    }

    public static rotate( rotationQuaternion: BABYLON.Quaternion, axis: BABYLON.Vector3, value: float ): void {
    
        rotationQuaternion.multiplyInPlace( BABYLON.Quaternion.RotationAxisToRef( axis, value, new BABYLON.Quaternion() ) );
    }

}