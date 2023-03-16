/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

type WebGLInstanceUniformLocation = int;

type WebGLAttributeLocation = int;

type GeometryPosition = [float, float, float];

type GeometryColor = [float, float, float];

type GeometryPolygon = [float, float, float, float, float, float];

type GeometryFace<
    T = int | float | GeometryPosition | GeometryColor | GeometryPolygon
> = [T, T, T];

type GeometryCell = GeometryFace<int>;

type GeometryLodConfig = [int, float, float];

type GeometryWrapData = {
    positions: GeometryPosition[];
    colors: GeometryColor[];
    cells: GeometryCell[];
};

type GeometryUnwrapData = {
    positions: Float32Array;
    colors: Float32Array;
};

type GeometryDataLod = {
    level: int;
    minimum: float;
    vertecies: Float32Array;
    colors: Float32Array;
    count: int;
};

type GeometryData = {
    name: string;
    shader: string;
    capacity: int;
    lods: Map<int, GeometryDataLod>;
};
