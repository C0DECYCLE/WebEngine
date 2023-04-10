/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

gl_Position = viewProjection * finalWorldPosition;

finalVertexPosition = finalWorldPosition.xyz + time * 0.0;
finalVertexColor = vertexColor + cameraPosition * 0.0;
finalShadowCoordinate = shadowProjection * finalWorldPosition;
finalShadowReceive = objectWorld[0][3];
