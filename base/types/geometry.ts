/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

type WebGLInstanceUniformLocation = int;

type WebGLAttributeLocation = int;

namespace WebEngine {
    export type GeometryPosition = [float, float, float];

    export type GeometryColor = [float, float, float];

    export type GeometryPolygon = [float, float, float, float, float, float];

    export type GeometryFace<
        T =
            | int
            | float
            | WebEngine.GeometryPosition
            | WebEngine.GeometryColor
            | WebEngine.GeometryPolygon
    > = [T, T, T];

    export type GeometryCell = WebEngine.GeometryFace<int>;

    export type GeometryLodConfig = [int, float, float];

    export type GeometryWrapData = {
        positions: WebEngine.GeometryPosition[];
        colors: WebEngine.GeometryColor[];
        cells: WebEngine.GeometryCell[];
    };

    export type GeometryUnwrapData = {
        positions: Float32Array;
        colors: Float32Array;
    };

    export type GeometryBounds = {
        min: Vec3;
        max: Vec3;
        size: float;
    };

    export type GeometryDataLod = {
        level: int;
        minimum: float;
        vertecies: Float32Array;
        colors: Float32Array;
        count: int;
        percentage: float;
    };

    export type GeometryData = {
        name: string;
        shader: string;
        capacity: int;
        lods: WebEngine.GeometryDataLod[];
        bounds: WebEngine.GeometryBounds;
    };
}
