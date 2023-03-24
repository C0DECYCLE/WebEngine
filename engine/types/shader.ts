/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

enum ShaderVariables {
    //uniforms
    CAMERADIRECTION = "cameraDirection",
    VIEWPROJECTION = "viewProjection",
    SHADOWPROJECTION = "shadowProjection",
    AMBIENTCOLOR = "ambientColor",
    LIGHTDIRECTION = "lightDirection",
    LIGHTCOLOR = "lightColor",
    SHADOWMAP = "shadowMap",
    SHADOWBIAS = "shadowBias",
    SHADOWOPACITY = "shadowOpacity",
    //instance uniforms
    OBJECTWORLD = "objectWorld",
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

type ShaderProgram = {
    program: WebGLProgram;
    uniformLocations: MapS<WebGLUniformLocation>;
    instanceUniformLocations: MapS<WebGLInstanceUniformLocation>;
    attributeLocations: MapS<WebGLAttributeLocation>;
};
