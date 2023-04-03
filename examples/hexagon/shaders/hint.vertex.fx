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

    finalWorldPosition.y += cos(time * 0.0025) * 0.5 - 0.5;

    #include vertexPost
}
