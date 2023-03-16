/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryParser {
    public static Obj(raw: string): GeometryData {
        const result: GeometryData = {} as GeometryData;
        result.lods = new Map<int, GeometryDataLod>();

        const vertecies: float[] = [];
        const colors: float[] = [];
        const polygons: GeometryPolygon[] = [[0, 0, 0, 0, 0, 0]];
        GeometryParser.UnpackData(raw, polygons, vertecies, colors, result);

        const baseVertecies: Float32Array = new Float32Array(vertecies);
        const baseColors: Float32Array = new Float32Array(colors);
        const wrap: GeometryWrapData = GeometryWrapper.Wrap(baseVertecies);

        for (let i: int = 0; i < Geometry.LodMatrix.length; i++) {
            const config: GeometryLodConfig = Geometry.LodMatrix[i];
            const count: int = Math.ceil(wrap.positions.length * config[2]);

            const dataVertecies: Float32Array =
                config[2] === 1.0
                    ? baseVertecies
                    : GeometryWrapper.Unwrap(simplify(wrap)(count));

            const dataColors: Float32Array =
                config[2] === 1.0
                    ? baseColors
                    : new Float32Array(colors.slice(0, dataVertecies.length));

            result.lods.set(config[0], {
                level: config[0],
                vertecies: dataVertecies,
                colors: GeometryParser.FlattenColors(dataColors),
                count: dataVertecies.length / 3,
            } as GeometryDataLod);
        }
        return result;
    }

    private static UnpackData(
        raw: string,
        polygons: GeometryPolygon[],
        vertecies: float[],
        colors: float[],
        result: GeometryData
    ) {
        const keywordRE: RegExp = /(\w*)(?: )*(.*)/;
        const lines: string[] = raw.split("\n");
        for (let i = 0; i < lines.length; ++i) {
            const line: string = lines[i].trim();
            if (line === "" || line.startsWith("#")) {
                continue;
            }
            const m: Nullable<RegExpExecArray> = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, _unparsedArgs] = m;
            const parts: string[] = line.split(/\s+/).slice(1);
            GeometryParser.ParseKeyword(
                keyword,
                parts,
                polygons,
                vertecies,
                colors,
                result
            );
        }
    }

    private static ParseKeyword(
        keyword: string,
        parts: string[],
        polygons: GeometryPolygon[],
        vertecies: float[],
        colors: float[],
        result: GeometryData
    ): void {
        if (keyword === "o") {
            GeometryParser.ParseKeywordO(parts, result);
        } else if (keyword === "v") {
            GeometryParser.ParseKeywordV(parts, polygons);
        } else if (keyword === "f") {
            GeometryParser.ParseKeywordF(parts, polygons, vertecies, colors);
        }
    }

    private static ParseKeywordO(parts: string[], result: GeometryData): void {
        if (result.name) {
            throw new Error(`Renderer: Obj file with multiple objects.`);
        }
        result.name = parts[0];
    }

    private static ParseKeywordV(
        parts: string[],
        polygons: GeometryPolygon[]
    ): void {
        if (parts.length < 3) {
            throw new Error(`Renderer: Obj file missing vertex part.`);
        }
        polygons.push([
            parseFloat(parts[0]),
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3]) || -1,
            parseFloat(parts[4]) || -1,
            parseFloat(parts[5]) || -1,
        ] as GeometryPolygon);
    }

    private static ParseKeywordF(
        parts: string[],
        polygons: GeometryPolygon[],
        vertecies: float[],
        colors: float[]
    ): void {
        const a: int = parseInt(parts[0]);
        const b: int = parseInt(parts[1]);
        const c: int = parseInt(parts[2]);
        GeometryParser.RegisterIndexedVertex(a, polygons, vertecies, colors);
        GeometryParser.RegisterIndexedVertex(b, polygons, vertecies, colors);
        GeometryParser.RegisterIndexedVertex(c, polygons, vertecies, colors);
    }

    private static RegisterIndexedVertex(
        index: int,
        polygons: GeometryPolygon[],
        vertecies: float[],
        colors: float[]
    ): void {
        const i: int = index + (index >= 0 ? 0 : polygons.length);
        vertecies.push(...polygons[i].slice(0, 3));
        colors.push(...polygons[i].slice(3, 6));
    }

    private static FlattenColors(colors: Float32Array): Float32Array {
        for (let i: int = 0; i < colors.length / (3 * 3); i++) {
            //@ts-ignore
            const face: GeometryFace<GeometryColor> = [];
            for (let j: int = 0; j < 3; j++) {
                face[j] = [
                    colors[i * (3 * 3) + 3 * j + 0],
                    colors[i * (3 * 3) + 3 * j + 1],
                    colors[i * (3 * 3) + 3 * j + 2],
                ] as GeometryColor;
            }
            if (!GeometryParser.EqualFace(face)) {
                GeometryParser.FlattenFace(colors, face, i);
            }
        }
        return colors;
    }

    private static EqualFace(face: GeometryFace<GeometryColor>): boolean {
        const x: boolean =
            face[0][0] === face[1][0] && face[0][0] === face[2][0];
        const y: boolean =
            face[0][1] === face[1][1] && face[0][1] === face[2][1];
        const z: boolean =
            face[0][2] === face[1][2] && face[0][2] === face[2][2];
        return x && y && z;
    }

    private static FlattenFace(
        data: Float32Array,
        face: GeometryFace<GeometryColor>,
        offset: int
    ): void {
        const provoking: GeometryColor = face
            .sort(
                (a: GeometryColor, b: GeometryColor) =>
                    a[0] + a[1] + a[2] - (b[0] + b[1] + b[2])
            )
            .reverse()[0];
        for (let i: int = 0; i < 3; i++) {
            data[offset * (3 * 3) + 3 * i + 0] = provoking[0];
            data[offset * (3 * 3) + 3 * i + 1] = provoking[1];
            data[offset * (3 * 3) + 3 * i + 2] = provoking[2];
        }
    }
}
