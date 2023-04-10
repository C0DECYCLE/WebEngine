/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryGenerator {
    public static Lod(
        config: GeometryLodConfig,
        baseVertecies: Float32Array,
        baseColors: Float32Array,
        wrap: GeometryWrapData
    ): GeometryDataLod {
        if (config[2] === 1.0) {
            return GeometryGenerator.BaseLod(config, baseVertecies, baseColors);
        }
        return GeometryGenerator.SimplifyLod(config, wrap);
    }

    private static BaseLod(
        config: GeometryLodConfig,
        vertecies: Float32Array,
        colors: Float32Array
    ): GeometryDataLod {
        return {
            level: config[0],
            minimum: config[1],
            vertecies: vertecies,
            colors: GeometryHelper.FlattenColors(colors),
            count: vertecies.length / 3,
            percentage: config[2],
        } as GeometryDataLod;
    }

    private static SimplifyLod(
        config: GeometryLodConfig,
        wrap: GeometryWrapData
    ): GeometryDataLod {
        const data: GeometryUnwrapData = GeometryWrapper.Unwrap(
            simplify(wrap)(Math.ceil(wrap.positions.length * config[2]))
        );
        return {
            level: config[0],
            minimum: config[1],
            vertecies: data.positions,
            colors: GeometryHelper.FlattenColors(data.colors),
            count: data.positions.length / 3,
            percentage: config[2],
        } as GeometryDataLod;
    }
}
