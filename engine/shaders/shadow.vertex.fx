#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

//uniforms
uniform mat4 viewProjection;

//instance uniforms
in mat4 objectWorld;

//attributes
in vec3 vertexPosition;

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
    gl_Position = viewProjection * cleanWorld() * vec4(vertexPosition, 1.0);
}