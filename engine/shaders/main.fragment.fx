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
uniform float shadowMapSize;

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

float getShading(float theta) {
    return max(0.0, theta * 0.5 + 0.5);
}

float getShadowPCF(vec3 shadowCoordinate, float currentDepth, float radius) {
    float result = 0.0; 
    float limit = (radius - 1.0) * 0.5;
    float x, y, depth, correct;
    for (y = -limit; y <= limit; y += 1.0) {
        for (x = -limit; x <= limit; x += 1.0) {
            depth = texture(shadowMap, shadowCoordinate.xy + vec2(x, y) / shadowMapSize).r;
            correct = mix(depth, 1.0 - depth, 0.5) * 0.1;
            result += depth <= currentDepth ? correct : 1.0; 
        }
    }
    return result /= radius * radius;
}

float getShadow(float theta) {
    vec3 shadowCoordinate = finalShadowCoordinate.xyz / finalShadowCoordinate.w;

    bool inRange = shadowCoordinate.x >= 0.0 && shadowCoordinate.x <= 1.0 && 
        shadowCoordinate.y >= 0.0 && shadowCoordinate.y <= 1.0 &&
        shadowCoordinate.z >= 0.0 && shadowCoordinate.z <= 1.0;

    float bias = shadowBias * tan(acos(theta));
    float currentDepth = shadowCoordinate.z - clamp(bias, 0.0, shadowBias * 2.0);
    float shadowDepth = getShadowPCF(shadowCoordinate, currentDepth, 4.0);

    return (inRange ? shadowDepth : 1.0) * shadowOpacity + (1.0 - shadowOpacity);
}
/*
vec3 getSpecular(vec3 faceNormal, float specularPower, float specularIntensity) {
    float product = dot(reflect(lightDirection, faceNormal), cameraDirection);
    return pow(max(0.0, product), specularPower) * lightColor * specularIntensity;
}
*/
//main
void main() {
    vec3 faceNormal = getFaceNormal(finalVertexPosition);
    vec3 finalColor = faceNormal * 0.5 + 0.5;

    if (finalVertexColor.x >= 0.0 && finalVertexColor.y >= 0.0 && finalVertexColor.z >= 0.0) {
        /*
        float specularPower = 2.0;
        float specularIntensity = 1.0;
        */
        float theta = dot(faceNormal, -lightDirection);
        float shade = getShading(theta);
        float shadow = bool(finalShadowReceive) ? getShadow(theta) : 1.0;
        //vec3 specular = getSpecular(faceNormal, specularPower, specularIntensity);
        
        finalColor = ambientColor + finalVertexColor * shade * shadow * lightColor/*;*/ + cameraDirection * 0.0;// + specular;
    }
    fragColor = vec4(finalColor, 1.0);
}
