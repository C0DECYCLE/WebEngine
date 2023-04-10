/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

vec3 faceNormal = getFaceNormal(finalVertexPosition);
vec3 finalColor = faceNormal * 0.5 + 0.5;

float specularPower = 1.0;
float specularIntensity = 0.0;
float alpha = 1.0;
