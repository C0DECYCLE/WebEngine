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

float getHalfLambert(vec3 faceNormal, vec3 lightDirection) {
    float shade = dot(faceNormal, -lightDirection) * 0.5 + 0.5;
    return shade * shade * 2.0;
}

void main() {
    vec3 faceNormal = getFaceNormal(finalVertexPosition);
    vec3 lightDirection = normalize(vec3(-1.0, -1.0, 1.0));

    vec3 objectColor = vec3(0.7, 0.5, 1.0);
    vec3 lightColor = vec3(1.0, 0.7, 0.3);

    fragColor = vec4(
        mix(
            objectColor, 
            lightColor * getHalfLambert(faceNormal, lightDirection),
            0.5
        ) * 0.75, 
        1.0
    );
    
    //fragColor = vec4(getFaceNormal(finalVertexPosition) * 0.5 + 0.5, 1.0);
}
