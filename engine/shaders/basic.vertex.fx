#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;
 
uniform mat4 objectMatrix;

layout(location = 0) in vec3 vertexPosition;
 
out vec3 finalVertexPosition;

void main() {

    vec4 finalClipSpace = objectMatrix * vec4(vertexPosition, 1.0);
    finalVertexPosition = finalClipSpace.xyz;

    gl_Position = finalClipSpace;
}