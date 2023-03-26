#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

//uniforms
uniform vec3 cameraDirection;
uniform vec3 ambientColor;
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform sampler2D shadowMap;
uniform float shadowBias;
uniform float shadowOpacity;

//vertex shader
in vec3 finalVertexPosition;
in vec3 finalVertexColor;
in vec4 finalShadowCoordinate;
in float finalShadowReceive;

//gl
out vec4 fragColor;

//methods
vec3 getFaceNormal(vec3 vertexPosition) {
    return normalize(cross(
        vec3(dFdx(finalVertexPosition.x), dFdx(finalVertexPosition.y), dFdx(finalVertexPosition.z)), 
        vec3(dFdy(finalVertexPosition.x), dFdy(finalVertexPosition.y), dFdy(finalVertexPosition.z))
    ));
}

float getShading(vec3 faceNormal, vec3 lightDirection) {
    float product = dot(faceNormal, -lightDirection) * 0.5 + 0.5;
    return pow(max(0.0, product), 1.0);
}

float getShadow() {
    vec3 shadowCoordinate = finalShadowCoordinate.xyz / finalShadowCoordinate.w;

    bool inRange = shadowCoordinate.x >= 0.0 && shadowCoordinate.x <= 1.0 && 
        shadowCoordinate.y >= 0.0 && shadowCoordinate.y <= 1.0 &&
        shadowCoordinate.z >= 0.0 && shadowCoordinate.z <= 1.0;

    float currentDepth = shadowCoordinate.z - shadowBias;
    float shadowDepth = texture(shadowMap, shadowCoordinate.xy).r;

    float result = (inRange && shadowDepth <= currentDepth) ? 0.0 : 1.0;
    return result;
}

vec3 getSpecular(vec3 faceNormal, float specularPower, float specularIntensity) {
    float product = dot(reflect(lightDirection, faceNormal), cameraDirection);
    return pow(max(0.0, product), specularPower) * lightColor * specularIntensity;
}

//main
void main() {
    vec3 faceNormal = getFaceNormal(finalVertexPosition);
    vec3 finalColor = faceNormal * 0.5 + 0.5;

    if (finalVertexColor.x >= 0.0 && finalVertexColor.y >= 0.0 && finalVertexColor.z >= 0.0) {
        
        float specularPower = 2.0;
        float specularIntensity = 0.0;

        float shade = getShading(faceNormal, lightDirection);
        float shadow = bool(finalShadowReceive) ? getShadow() * shadowOpacity + (1.0 - shadowOpacity) : 1.0;
        vec3 specular = getSpecular(faceNormal, specularPower, specularIntensity);
        
        finalColor = ambientColor + finalVertexColor * shade * shadow * lightColor; // + specular;
    }

    fragColor = vec4(finalColor, 1.0);
}
