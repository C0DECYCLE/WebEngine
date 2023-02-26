#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;
 
uniform mat3 object_matrix;

layout(location = 0) in vec2 vertex_position;
 
void main() {

    vec2 position = (object_matrix * vec3(vertex_position, 1.0)).xy;

    gl_Position = vec4(position, 0.0, 1.0);
}