#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

//uniforms
uniform mat4 viewProjection;
uniform mat4 shadowProjection;

//instance uniforms
in mat4 objectWorld;

//attributes
in vec3 vertexPosition;
in vec3 vertexColor;
 
//fragment shader
out vec3 finalVertexPosition;
out vec3 finalVertexColor;
out vec4 finalShadowCoordinate;
out float finalShadowReceive;

//methods
mat4 cleanWorld() {
    mat4 world = objectWorld;
    world[0][3] = 0.0;
    world[1][3] = 0.0;
    world[2][3] = 0.0;
    world[3][3] = 1.0;
    return world;
}

//main
void main() {
    vec4 finalWorldPosition = cleanWorld() * vec4(vertexPosition, 1.0);

    gl_Position = viewProjection * finalWorldPosition;

    finalVertexPosition = finalWorldPosition.xyz;
    finalVertexColor = vertexColor;
    finalShadowCoordinate = shadowProjection * finalWorldPosition;
    finalShadowReceive = objectWorld[0][3];
}