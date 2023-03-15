/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

type WebGLInstanceUniformLocation = int;

type WebGLAttributeLocation = int;

type GeometryPolygon = [float, float, float, float, float, float];
type GeometryPosition = [float, float, float];
type GeometryCell = [int, int, int];

type GeometryWrapData = {
    positions: GeometryPosition[];
    cells: GeometryCell[];
};

type GeometryData = {
    name: string;
    capacity: int;
    shader: string;
    vertecies: Float32Array;
    colors: Float32Array;
    count: int;
};
