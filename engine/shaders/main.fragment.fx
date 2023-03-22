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
    float product = dot(faceNormal, -lightDirection); /* * 0.5 + 0.5;*/
    return pow(max(0.0, product), 1.0 /*2.0*/);
}

vec3 getSpecular(vec3 faceNormal, vec3 lightDirection, vec3 cameraDirection, vec3 lightColor, float specularPower, float specularIntensity) {
    float product = dot(reflect(lightDirection, faceNormal), cameraDirection);
    return pow(max(0.0, product), specularPower) * lightColor * specularIntensity;
}

void main() {
    vec3 faceNormal = getFaceNormal(finalVertexPosition);
    vec3 finalColor = faceNormal * 0.5 + 0.5;

    if (finalVertexColor.x >= 0.0 && finalVertexColor.y >= 0.0 && finalVertexColor.z >= 0.0) {

        /*
        vec3 ambient = vec3(0.18,0.04,0.27) * 0.5;

        vec3 lightColor = vec3(1.0,0.89,0.73); //vec3(1.0,0.89,0.73);
        vec3 lightDirection = normalize(vec3(1.0, -1.0, 1.0));
        
        float shade = getShading(faceNormal, lightDirection);

        finalColor = ambient + (finalVertexColor * shade) * lightColor;

        if (finalVertexColor.x == 0.6489 && finalVertexColor.y == 0.9623) {

            vec3 viewDirection = normalize(vec3(0.0, 1.25, -1.0));
            vec3 lightReflectDirection = reflect(lightDirection, faceNormal);
            vec3 specularity = pow(max(0.0, dot(lightReflectDirection, viewDirection)), 3.0 / 4.0) * 1.0 * lightColor;

            ambient = vec3(0.4,0.9,1.0) * 0.25;
            finalColor = ambient + (finalVertexColor * shade + specularity) * lightColor;
        }
        */

        vec3 cameraDirection = normalize(vec3(0.0, 1.25, -1.0));
        vec3 ambientColor = vec3(0.05,0.015,0.1);
        vec3 lightDirection = normalize(vec3(1.0, -1.0, 1.0));
        vec3 lightColor = vec3(1.0, 0.8, 0.7);
        float specularPower = 2.0;
        float specularIntensity = 0.0;

        float shade = getShading(faceNormal, lightDirection);
        vec3 specular = getSpecular(faceNormal, lightDirection, cameraDirection, lightColor, specularPower, specularIntensity);
        
        finalColor = ambientColor + finalVertexColor * shade * lightColor + specular;
    }
    
    //finalColor = finalVertexColor;
    //finalColor = faceNormal * 0.5 + 0.5;
    //float depth = 1.0 / log(finalDepthValue); finalColor = vec3(depth, depth, depth);
    
    fragColor = vec4(finalColor, 1.0);

    /*
    if (finalVertexColor.x == 0.6489 && finalVertexColor.y == 0.9623) {
        
        fragColor = vec4(finalColor, 0.5);
    }
    */
}
