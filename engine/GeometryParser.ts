/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryParser {
    public static Obj(raw: string): GeometryData {
        const result: GeometryData = {} as GeometryData;
        const vertecies: float[] = [];
        const colors: float[] = [];
        const polygons: GeometryParserPolygon[] = [[0, 0, 0, 0, 0, 0]];
        result.wasIndexed = false;
        GeometryParser.UnpackData(raw, polygons, vertecies, colors, result);
        GeometryParser.HandleUnindexed(polygons, vertecies, colors, result);
        result.vertecies = new Float32Array(vertecies);
        result.colors = new Float32Array(colors);
        result.count = result.vertecies.length / 3;
        return result;
    }

    private static UnpackData(
        raw: string,
        polygons: GeometryParserPolygon[],
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
        polygons: GeometryParserPolygon[],
        vertecies: float[],
        colors: float[],
        result: GeometryData
    ): void {
        if (keyword === "o") {
            GeometryParser.ParseKeywordO(parts, result);
        } else if (keyword === "v") {
            GeometryParser.ParseKeywordV(parts, polygons);
        } else if (keyword === "f") {
            GeometryParser.ParseKeywordF(
                parts,
                polygons,
                vertecies,
                colors,
                result
            );
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
        polygons: GeometryParserPolygon[]
    ): void {
        if (parts.length < 3) {
            throw new Error(`Renderer: Obj file missing vertex part.`);
        }
        polygons.push([
            parseFloat(parts[0]),
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3]) || 0, //Math.random(),
            parseFloat(parts[4]) || 0, //Math.random(),
            parseFloat(parts[5]) || 0, //Math.random(),
        ]);
    }

    private static ParseKeywordF(
        parts: string[],
        polygons: GeometryParserPolygon[],
        vertecies: float[],
        colors: float[],
        result: GeometryData
    ): void {
        if (result.wasIndexed === false) {
            result.wasIndexed = true;
        }
        GeometryParser.RegisterIndexedTriangle(
            parts,
            polygons,
            vertecies,
            colors
        );
    }

    private static RegisterIndexedTriangle(
        parts: string[],
        polygons: GeometryParserPolygon[],
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
        polygons: GeometryParserPolygon[],
        vertecies: float[],
        colors: float[]
    ): void {
        const i: int = index + (index >= 0 ? 0 : polygons.length);
        GeometryParser.PushPolygon(polygons[i], vertecies, colors);
    }

    private static HandleUnindexed(
        polygons: GeometryParserPolygon[],
        vertecies: float[],
        colors: float[],
        result: GeometryData
    ): void {
        if (result.wasIndexed === true) {
            return;
        }
        for (let i = 1; i < polygons.length; i++) {
            GeometryParser.PushPolygon(polygons[i], vertecies, colors);
        }
    }

    private static PushPolygon(
        polygon: GeometryParserPolygon,
        vertecies: float[],
        colors: float[]
    ): void {
        vertecies.push(...polygon.slice(0, 3));
        colors.push(...polygon.slice(3, 6));
    }
}
