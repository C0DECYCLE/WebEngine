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
 
out vec3 finalVertexPosition;

void main() {

    vec4 finalWorldPosition = objectWorld * vec4(vertexPosition, 1.0);
    finalVertexPosition = finalWorldPosition.xyz;

    gl_Position = viewProjection * finalWorldPosition;
}