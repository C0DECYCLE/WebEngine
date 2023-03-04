/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

enum ShaderVariables {
    VIEWPROJECTION = "viewProjection",
    OBJECTWORLD = "objectWorld",
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
