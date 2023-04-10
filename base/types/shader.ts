/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export enum ShaderVariables {
        //uniforms
        TIME = "time",
        CAMERAPOSITION = "cameraPosition",
        CAMERADIRECTION = "cameraDirection",
        VIEWPROJECTION = "viewProjection",
        SHADOWPROJECTION = "shadowProjection",
        AMBIENTCOLOR = "ambientColor",
        LIGHTDIRECTION = "lightDirection",
        LIGHTCOLOR = "lightColor",
        SHADOWMAP = "shadowMap",
        SHADOWBIAS = "shadowBias",
        SHADOWOPACITY = "shadowOpacity",
        SHADOWMAPSIZE = "shadowMapSize",
        //instance uniforms
        OBJECTWORLD = "objectWorld",
        //instance sub uniforms
        SHADOWRECEIVE = "0",
        //attributes
        VERTEXPOSITION = "vertexPosition",
        VERTEXCOLOR = "vertexColor",
    }

    export enum ShaderTypes {
        VERTEX = "vertex",
        FRAGMENT = "fragment",
    }

    export type ShaderPair = {
        [WebEngine.ShaderTypes.VERTEX]: WebGLShader;
        [WebEngine.ShaderTypes.FRAGMENT]: WebGLShader;
    };

    export type ShaderSourcePair = {
        [WebEngine.ShaderTypes.VERTEX]: string;
        [WebEngine.ShaderTypes.FRAGMENT]: string;
    };

    export type ShaderSourceInfo = {
        name: string;
        type: WebEngine.ShaderTypes;
    };

    export class ShaderVariableMap<T> extends Map<
        WebEngine.ShaderVariables,
        T
    > {}

    export type ShaderProgram = {
        program: WebGLProgram;
        uniformLocations: WebEngine.ShaderVariableMap<WebGLUniformLocation>;
        instanceUniformLocations: WebEngine.ShaderVariableMap<WebGLInstanceUniformLocation>;
        attributeLocations: WebEngine.ShaderVariableMap<WebGLAttributeLocation>;
    };
}
