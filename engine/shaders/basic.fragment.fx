#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;
 
uniform vec3 object_color;

out vec4 color;

void main() {

    color = vec4(object_color, 1.0);
}
