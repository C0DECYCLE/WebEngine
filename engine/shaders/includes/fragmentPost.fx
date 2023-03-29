/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

if (finalVertexColor.x >= 0.0 && finalVertexColor.y >= 0.0 && finalVertexColor.z >= 0.0) {
    
    float theta = dot(faceNormal, -lightDirection);
    float shade = getShading(theta);
    float shadow = bool(finalShadowReceive) ? getShadow(theta) : 1.0;
    vec3 specular = getSpecular(faceNormal, specularPower, specularIntensity);
    
    finalColor = ambientColor + finalVertexColor * shade * shadow * lightColor + specular;
}

fragColor = vec4(finalColor * alpha, alpha);
