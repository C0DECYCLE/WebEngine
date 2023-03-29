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

#include vertexMethods

void main() {
    gl_Position = viewProjection * cleanWorld() * vec4(vertexPosition, 1.0);
}
