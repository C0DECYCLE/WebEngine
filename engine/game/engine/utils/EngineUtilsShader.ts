/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class EngineUtilsShader implements IEngineUtilsShader {

    public static code: string = ( function(): string { 
        
        ( async function(): Promise<string> { 
            
            return await ( await fetch( "../game/engine/utils/EngineUtilsShader.glsl" ) ).text();

        } )().then( ( decode: string ): void => { EngineUtilsShader.code = decode; } );
        
       return "";

    } )();

    public static registerInstanceAttribute( mesh: BABYLON.Mesh, name: string, defaultValue: any ): void {
        
        const arrayValue: float[] = [];

        defaultValue.toArray?.( arrayValue );
        
        mesh.registerInstancedBuffer( name, arrayValue.length || 1 );
        mesh.instancedBuffers[ name ] = defaultValue;
    }

    public static setInstanceAttribute( instance: BABYLON.InstancedMesh, name: string, value: any ): void {

        instance.instancedBuffers[ name ] = value;
    }

}