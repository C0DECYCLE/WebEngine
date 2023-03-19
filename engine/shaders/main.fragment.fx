#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

in vec3 finalVertexPosition;
in vec3 finalVertexColor;
in float finalDepthValue;

out vec4 fragColor;

vec3 getFaceNormal(vec3 vertexPosition) {
    return normalize(cross(
        vec3(dFdx(finalVertexPosition.x), dFdx(finalVertexPosition.y), dFdx(finalVertexPosition.z)), 
        vec3(dFdy(finalVertexPosition.x), dFdy(finalVertexPosition.y), dFdy(finalVertexPosition.z))
    ));
}

float getShading(vec3 faceNormal, vec3 lightDirection) {
    float shade = max(0.0, dot(faceNormal, -lightDirection)) * 0.5 + 0.5;
    return (shade * shade) * 1.0;
}

void main() {
    vec3 faceNormal = getFaceNormal(finalVertexPosition);
    vec3 finalColor = faceNormal * 0.5 + 0.5;

    if (finalVertexColor.x >= 0.0 && finalVertexColor.y >= 0.0 && finalVertexColor.z >= 0.0) {

        vec3 lightColor = vec3(1.0, 1.0, 1.0);
        vec3 lightDirection = normalize(vec3(1.0, -1.0, 1.0));
        
        float shade = getShading(faceNormal, lightDirection);
        finalColor = finalVertexColor * shade * lightColor;
    }
    
    //finalColor = finalVertexColor;
    //finalColor = faceNormal * 0.5 + 0.5;
    //float depth = 1.0 / log(finalDepthValue); finalColor = vec3(depth, depth, depth);

    fragColor = vec4(finalColor, 1.0);
}
