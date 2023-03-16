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
        GeometryParser.UnpackData(raw, vertecies, colors, result);

        const baseVertecies: Float32Array = new Float32Array(vertecies);
        const baseColors: Float32Array = new Float32Array(colors);
        const wrap: GeometryWrapData = GeometryWrapper.Wrap(baseVertecies);

        for (let i: int = 0; i < Geometry.LodMatrix.length; i++) {
            const config: GeometryLodConfig = Geometry.LodMatrix[i];
            result.lods.set(
                config[0],
                GeometryGenerator.Lod(config, baseVertecies, baseColors, wrap)
            );
        }
        return result;
    }

    private static UnpackData(
        raw: string,
        vertecies: float[],
        colors: float[],
        result: GeometryData
    ) {
        const polygons: GeometryPolygon[] = [[0, 0, 0, 0, 0, 0]];
        const keywordRE: RegExp = /(\w*)(?: )*(.*)/;
        const lines: string[] = raw.split("\n");
        for (let i = 0; i < lines.length; ++i) {
            GeometryParser.ParseLine(
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
        polygons: GeometryPolygon[],
        vertecies: float[],
        colors: float[],
        result: GeometryData
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
        GeometryParser.ParseKeyword(
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
}
