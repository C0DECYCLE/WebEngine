/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

float theta = dot(faceNormal, -lightDirection);
float shade = getShading(theta);
float shadow = bool(finalShadowReceive) ? getShadow(theta) : 1.0;
vec3 specular = getSpecular(faceNormal, specularPower, specularIntensity);

finalColor = ambientColor + color * shade * shadow * lightColor + specular;
