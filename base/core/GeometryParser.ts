/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class GeometryParser {
        public static Obj(
            raw: string,
            lodMatrix: WebEngine.GeometryLodConfig[] = WebEngine.Geometry
                .LodMatrix
        ): WebEngine.GeometryData {
            const result: WebEngine.GeometryData = {} as WebEngine.GeometryData;
            result.lods = [];

            const vertecies: float[] = [];
            const colors: float[] = [];
            WebEngine.GeometryParser.UnpackData(raw, vertecies, colors, result);

            const baseVertecies: Float32Array = new Float32Array(vertecies);
            const baseColors: Float32Array = new Float32Array(colors);
            const wrap: WebEngine.GeometryWrapData =
                WebEngine.GeometryWrapper.Wrap({
                    positions: baseVertecies,
                    colors: baseColors,
                } as WebEngine.GeometryUnwrapData);

            result.bounds =
                WebEngine.GeometryHelper.ComputeBounds(baseVertecies);

            for (let i: int = 0; i < lodMatrix.length; i++) {
                const config: WebEngine.GeometryLodConfig = lodMatrix[i];
                if (result.lods[config[0]]) {
                    warn(
                        "WebEngine.GeometryParser: Duplicate lod levels on geometry."
                    );
                }
                result.lods[config[0]] = WebEngine.GeometryGenerator.Lod(
                    config,
                    baseVertecies,
                    baseColors,
                    wrap
                );
            }
            return result;
        }

        private static UnpackData(
            raw: string,
            vertecies: float[],
            colors: float[],
            result: WebEngine.GeometryData
        ) {
            const polygons: WebEngine.GeometryPolygon[] = [[0, 0, 0, 0, 0, 0]];
            const keywordRE: RegExp = /(\w*)(?: )*(.*)/;
            const lines: string[] = raw.split("\n");
            for (let i = 0; i < lines.length; ++i) {
                WebEngine.GeometryParser.ParseLine(
                    keywordRE,
                    lines[i].trim(),
                    polygons,
                    vertecies,
                    colors,
                    result
                );
            }
        }

        private static ParseLine(
            keywordRE: RegExp,
            line: string,
            polygons: WebEngine.GeometryPolygon[],
            vertecies: float[],
            colors: float[],
            result: WebEngine.GeometryData
        ): void {
            if (line === "" || line.startsWith("#")) {
                return;
            }
            const m: Nullable<RegExpExecArray> = keywordRE.exec(line);
            if (!m) {
                return;
            }
            const [, keyword, _unparsedArgs] = m;
            const parts: string[] = line.split(/\s+/).slice(1);
            WebEngine.GeometryParser.ParseKeyword(
                keyword,
                parts,
                polygons,
                vertecies,
                colors,
                result
            );
        }

        private static ParseKeyword(
            keyword: string,
            parts: string[],
            polygons: WebEngine.GeometryPolygon[],
            vertecies: float[],
            colors: float[],
            result: WebEngine.GeometryData
        ): void {
            if (keyword === "o") {
                WebEngine.GeometryParser.ParseKeywordO(parts, result);
            } else if (keyword === "v") {
                WebEngine.GeometryParser.ParseKeywordV(parts, polygons);
            } else if (keyword === "f") {
                WebEngine.GeometryParser.ParseKeywordF(
                    parts,
                    polygons,
                    vertecies,
                    colors
                );
            }
        }

        private static ParseKeywordO(
            parts: string[],
            result: WebEngine.GeometryData
        ): void {
            if (result.name) {
                throw new Error(
                    `WebEngine.GeometryParser: Obj file with multiple objects.`
                );
            }
            parts = parts[0].split("_");
            result.name = parts[0];
            result.shader = parts[2] || "main";
            result.capacity = parseInt(parts[1] || "10");
        }

        private static ParseKeywordV(
            parts: string[],
            polygons: WebEngine.GeometryPolygon[]
        ): void {
            if (parts.length < 3) {
                throw new Error(
                    `WebEngine.GeometryParser: Obj file missing vertex part.`
                );
            }
            polygons.push([
                parseFloat(parts[0]),
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3]) || -1,
                parseFloat(parts[4]) || -1,
                parseFloat(parts[5]) || -1,
            ] as WebEngine.GeometryPolygon);
        }

        private static ParseKeywordF(
            parts: string[],
            polygons: WebEngine.GeometryPolygon[],
            vertecies: float[],
            colors: float[]
        ): void {
            const a: int = parseInt(parts[0]);
            const b: int = parseInt(parts[1]);
            const c: int = parseInt(parts[2]);
            WebEngine.GeometryParser.RegisterIndexedVertex(
                a,
                polygons,
                vertecies,
                colors
            );
            WebEngine.GeometryParser.RegisterIndexedVertex(
                b,
                polygons,
                vertecies,
                colors
            );
            WebEngine.GeometryParser.RegisterIndexedVertex(
                c,
                polygons,
                vertecies,
                colors
            );
        }

        private static RegisterIndexedVertex(
            index: int,
            polygons: WebEngine.GeometryPolygon[],
            vertecies: float[],
            colors: float[]
        ): void {
            const i: int = index + (index >= 0 ? 0 : polygons.length);
            vertecies.push(...polygons[i].slice(0, 3));
            colors.push(...polygons[i].slice(3, 6));
        }
    }
}
