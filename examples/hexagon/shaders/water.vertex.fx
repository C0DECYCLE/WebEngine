#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

#include vertexVariables
#include vertexMethods

void main() {
    #include vertexPre

    vec2 c = (finalWorldPosition.xz + cameraPosition.xz) * 1000.0 + time * 0.001;
    finalWorldPosition.y += cos(c.x) * sin(c.y) * 0.5;

    #include vertexPost
}
