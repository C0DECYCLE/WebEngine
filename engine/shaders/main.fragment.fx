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

float getShading(vec3 faceNormal, vec3 lightDirection) {
    float shade = dot(faceNormal, -lightDirection) * 0.5 + 0.5;
    return shade * shade * 2.0;
}

void main() {
    vec3 faceNormal = getFaceNormal(finalVertexPosition);
    /*    
    vec3 lightColor = vec3(1.0, 0.7, 0.3);
    vec3 lightDirection = normalize(vec3(-1.0, -1.0, 1.0));

    if (finalVertexColor.x < 0.0 || 
        finalVertexColor.y < 0.0 || 
        finalVertexColor.z < 0.0) {

        fragColor = vec4(getFaceNormal(finalVertexPosition) * 0.5 + 0.5, 1.0);

    } else {

        fragColor = vec4(
            mix(
                finalVertexColor, //vec3(0.7, 0.5, 1.0);
                lightColor * getShading(faceNormal, lightDirection),
                0.5
            ) * 0.75, 
            1.0
        );
    }
    */
    //fragColor = vec4(finalVertexColor, 1.0);
    
    fragColor = vec4(getFaceNormal(finalVertexPosition) * 0.5 + 0.5, 1.0);
    
    float depth = 1.0 / log(finalDepthValue);
    //fragColor = vec4(depth, depth, depth, 1.0);
}
