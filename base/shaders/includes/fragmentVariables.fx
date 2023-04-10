/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

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
