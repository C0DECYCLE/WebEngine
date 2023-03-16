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
        return GeometryGenerator.SimplifyLod(config, baseColors, wrap);
    }

    private static BaseLod(
        config: GeometryLodConfig,
        vertecies: Float32Array,
        colors: Float32Array
    ): GeometryDataLod {
        return {
            level: config[0],
            vertecies: vertecies,
            colors: GeometryHelper.FlattenColors(colors),
            count: vertecies.length / 3,
        } as GeometryDataLod;
    }

    private static SimplifyLod(
        config: GeometryLodConfig,
        baseColors: Float32Array,
        wrap: GeometryWrapData
    ): GeometryDataLod {
        const vertecies: Float32Array = GeometryWrapper.Unwrap(
            simplify(wrap)(Math.ceil(wrap.positions.length * config[2]))
        );
        const colors: Float32Array = new Float32Array(
            Array.from(baseColors).slice(0, vertecies.length)
        );
        return {
            level: config[0],
            vertecies: vertecies,
            colors: GeometryHelper.FlattenColors(colors),
            count: vertecies.length / 3,
        } as GeometryDataLod;
    }
}
