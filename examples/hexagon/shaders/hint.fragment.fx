#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

#include fragmentVariables
#include fragmentMethods

void main() {
    #include fragmentPre

    alpha = 0.5;
    float theta = dot(faceNormal, -lightDirection);
    float shade = getShading(theta);
    finalColor = (vec3(0.5, 0.5, 0.5) + ambientColor) * 0.5 + finalVertexColor * shade + 0.0 * (cameraDirection + ambientColor + lightColor) * texture(shadowMap, vec2(0.0, 0.0)).x * shadowBias * shadowOpacity * shadowMapSize;

    #include fragmentPost
}
