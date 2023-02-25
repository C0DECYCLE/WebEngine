#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;
 
layout(location = 0) in vec4 vertex_position;
 
void main() {

    gl_Position = vertex_position;
}