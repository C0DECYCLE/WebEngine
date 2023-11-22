#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

//attributes
in vec4 vertexPosition;

void main() {
    gl_Position = vertexPosition;
}
