/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class GeometryGenerator {
        public static Lod(
            config: WebEngine.GeometryLodConfig,
            baseVertecies: Float32Array,
            baseColors: Float32Array,
            wrap: WebEngine.GeometryWrapData
        ): WebEngine.GeometryDataLod {
            if (config[2] === 1.0) {
                return WebEngine.GeometryGenerator.BaseLod(
                    config,
                    baseVertecies,
                    baseColors
                );
            }
            return WebEngine.GeometryGenerator.SimplifyLod(config, wrap);
        }

        private static BaseLod(
            config: WebEngine.GeometryLodConfig,
            vertecies: Float32Array,
            colors: Float32Array
        ): WebEngine.GeometryDataLod {
            return {
                level: config[0],
                minimum: config[1],
                vertecies: vertecies,
                colors: WebEngine.GeometryHelper.FlattenColors(colors),
                count: vertecies.length / 3,
                percentage: config[2],
            } as WebEngine.GeometryDataLod;
        }

        private static SimplifyLod(
            config: WebEngine.GeometryLodConfig,
            wrap: WebEngine.GeometryWrapData
        ): WebEngine.GeometryDataLod {
            const data: WebEngine.GeometryUnwrapData =
                WebEngine.GeometryWrapper.Unwrap(
                    simplify(wrap)(Math.ceil(wrap.positions.length * config[2]))
                );
            return {
                level: config[0],
                minimum: config[1],
                vertecies: data.positions,
                colors: WebEngine.GeometryHelper.FlattenColors(data.colors),
                count: data.positions.length / 3,
                percentage: config[2],
            } as WebEngine.GeometryDataLod;
        }
    }
}
