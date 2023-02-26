#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;
 
uniform mat4 object_matrix;

layout(location = 0) in vec3 vertex_position;
 
void main() {

    vec3 position = (object_matrix * vec4(vertex_position, 1.0)).xyz;

    gl_Position = vec4(position, 1.0);
}