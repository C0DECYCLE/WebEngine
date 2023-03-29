/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

//uniforms
uniform float time;
uniform vec3 cameraPosition;
uniform mat4 viewProjection;
uniform mat4 shadowProjection;

//instance uniforms
in mat4 objectWorld;

//attributes
in vec3 vertexPosition;
in vec3 vertexColor;
 
//fragment shader
out vec3 finalVertexPosition;
out vec3 finalVertexColor;
out vec4 finalShadowCoordinate;
out float finalShadowReceive;
