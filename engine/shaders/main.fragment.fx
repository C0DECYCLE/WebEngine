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

//vertex shader
in vec3 finalVertexPosition;
in vec3 finalVertexColor;

//webgl
out vec4 fragColor;

//functions
vec3 getFaceNormal(vec3 vertexPosition) {
    return normalize(cross(
        vec3(dFdx(finalVertexPosition.x), dFdx(finalVertexPosition.y), dFdx(finalVertexPosition.z)), 
        vec3(dFdy(finalVertexPosition.x), dFdy(finalVertexPosition.y), dFdy(finalVertexPosition.z))
    ));
}

float getShading(vec3 faceNormal, vec3 lightDirection) {
    float product = dot(faceNormal, -lightDirection); /* * 0.5 + 0.5;*/
    return pow(max(0.0, product), 1.0 /*2.0*/);
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
        vec3 specular = getSpecular(faceNormal, specularPower, specularIntensity);
        
        finalColor = ambientColor + finalVertexColor * shade * lightColor; // + specular;
    }
    
    //finalColor = finalVertexColor;
    //finalColor = faceNormal * 0.5 + 0.5;
    
    fragColor = vec4(finalColor, 1.0);
}
