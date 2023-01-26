/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class EngineExtensions implements IEngineExtensions {

    public static setLightColor( light: BABYLON.DirectionalLight | BABYLON.PointLight | BABYLON.HemisphericLight, hexColor: string ): void {

        light.diffuse = BABYLON.Color3.FromHexString( hexColor );
        light.specular = new BABYLON.Color3( 0, 0, 0 );
        
        if ( light instanceof BABYLON.HemisphericLight ) {

            light.groundColor = new BABYLON.Color3( 0, 0, 0 );
        }
    }

    public static setLightIntensity( light: BABYLON.DirectionalLight | BABYLON.PointLight | BABYLON.HemisphericLight, intensity: float = 1.0 ): void {

        if ( scene.ambientColor.ambientCache !== undefined ) {

            light.intensity = intensity * ( 1 / (scene.ambientColor.ambientCache[1] * 0.5) );
        }
    }

    public static setStandardMaterialColorIntensity( material: BABYLON.StandardMaterial, hexColor: string, intensity: float = 1.0 ): void {
        
        BABYLON.Color3.FromHexString( hexColor ).scaleToRef( intensity, material.diffuseColor );
        
        EngineExtensions.setupStandardMaterialDefault( material, material.diffuseColor );
    }

    public static setupStandardMaterialDefault( material: BABYLON.StandardMaterial, colors: BABYLON.Color3 | BABYLON.Color3[] ): void {
        
        let list: BABYLON.Color3[];

        if ( colors instanceof BABYLON.Color3 ) {
            
            list = [ colors ];

        } else {

            list = colors;
        }
        
        material.specularColor = new BABYLON.Color3( 0, 0, 0 );
        material.emissiveColor = new BABYLON.Color3( 0, 0, 0 );
        material.ambientColor = new BABYLON.Color3( 0, 0, 0 );

        if ( scene.ambientColor.ambientCache !== undefined ) {
        
            for ( let i = 0; i < list.length; i++ ) {
    
                list[i].scaleToRef( scene.ambientColor.ambientCache[1], list[i] );
            }
    
            BABYLON.Color3.FromHexString( scene.ambientColor.ambientCache[0] ).scaleToRef( scene.ambientColor.ambientCache[1] * 0.5, material.ambientColor );
        }
    }
    
    public static minmax( vector: BABYLON.Vector3 ): void {

        vector.min = Math.min( vector.x, vector.y, vector.z );
        vector.max = Math.max( vector.x, vector.y, vector.z );
        vector.biggest = Math.abs( vector.min ) > Math.abs( vector.max ) ? vector.min : vector.max;
    }

    public static round( vector: BABYLON.Vector3 ): BABYLON.Vector3 {

        vector.x = Math.round( vector.x );
        vector.y = Math.round( vector.y );
        vector.z = Math.round( vector.z );

        return vector;
    }

    public static color3ToVector3( color: BABYLON.Color3 ): BABYLON.Vector3 {

        return new BABYLON.Vector3( color.r, color.g, color.b );
    }

}