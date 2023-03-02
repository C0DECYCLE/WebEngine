#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

in vec3 finalVertexPosition;

out vec4 fragColor;

vec3 getFaceNormal(vec3 vertexPosition) {
    return normalize(cross(vec3(
        dFdx(finalVertexPosition.x), 
        dFdx(finalVertexPosition.y), 
        dFdx(finalVertexPosition.z)
    ), vec3(
        dFdy(finalVertexPosition.x), 
        dFdy(finalVertexPosition.y), 
        dFdy(finalVertexPosition.z)
    )));
}

void main() {
    fragColor = vec4(getFaceNormal(finalVertexPosition) * 0.5 + 0.5, 1.0);
}
