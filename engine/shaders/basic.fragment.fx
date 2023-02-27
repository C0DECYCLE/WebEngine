#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

in vec3 finalVertexPosition;

out vec4 fragColor;

void main() {

    vec3 dFdxPosition = vec3(dFdx(finalVertexPosition.x), dFdx(finalVertexPosition.y), dFdx(finalVertexPosition.z));
    vec3 dFdyPosition = vec3(dFdy(finalVertexPosition.x), dFdy(finalVertexPosition.y), dFdy(finalVertexPosition.z));
    vec3 faceNormal = normalize(cross(dFdxPosition, dFdyPosition));
    
    //fragColor = vec4(faceNormal * 0.5 + 0.5, 1.0);
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
