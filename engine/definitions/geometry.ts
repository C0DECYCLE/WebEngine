/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

type WebGLInstanceUniformLocation = int;

type WebGLAttributeLocation = int;

type GeometryParserPolygon = [float, float, float, float, float, float];

type GeometryData = {
    name: string;
    capacity: int;
    shader: string;
    vertecies: Float32Array;
    colors: Float32Array;
    wasIndexed: boolean;
    count: int;
};
