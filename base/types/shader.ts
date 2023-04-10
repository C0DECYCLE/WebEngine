/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

enum ShaderVariables {
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

enum ShaderTypes {
    VERTEX = "vertex",
    FRAGMENT = "fragment",
}

type ShaderPair = {
    [ShaderTypes.VERTEX]: WebGLShader;
    [ShaderTypes.FRAGMENT]: WebGLShader;
};

type ShaderSourcePair = {
    [ShaderTypes.VERTEX]: string;
    [ShaderTypes.FRAGMENT]: string;
};

type ShaderSourceInfo = {
    name: string;
    type: ShaderTypes;
};

class ShaderVariableMap<T> extends Map<ShaderVariables, T> {}

type ShaderProgram = {
    program: WebGLProgram;
    uniformLocations: ShaderVariableMap<WebGLUniformLocation>;
    instanceUniformLocations: ShaderVariableMap<WebGLInstanceUniformLocation>;
    attributeLocations: ShaderVariableMap<WebGLAttributeLocation>;
};
