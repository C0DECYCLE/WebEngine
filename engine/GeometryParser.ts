/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryParser {
    public static UnwrapVertecies(data: GeometryWrapData): Float32Array {
        const vertecies: Float32Array = new Float32Array(
            data.cells.length * 3 * 3
        );
        for (let i: int = 0; i < data.cells.length; i++) {
            const cell: GeometryParserCell = data.cells[i];
            for (let j: int = 0; j < 3; j++) {
                const index: int = i * 3 + j;
                const polygon: GeometryParserPosition = data.positions[cell[j]];
                for (let k: int = 0; k < 3; k++) {
                    vertecies[index * 3 + k] = polygon[k]; // || -1;
                }
            }
        }
        return vertecies;
    }

    public static WrapVertecies(vertecies: Float32Array): GeometryWrapData {
        const data: GeometryWrapData = {
            positions: [],
            cells: [],
        } as GeometryWrapData;
        for (let i: int = 0; i < vertecies.length / (3 * 3); i++) {
            data.cells.push([i * 3, i * 3 + 1, i * 3 + 2]);
        }
        for (let i: int = 0; i < vertecies.length / 3; i++) {
            data.positions.push([
                vertecies[i * 3],
                vertecies[i * 3 + 1],
                vertecies[i * 3 + 2],
            ]);
        }
        const cleanPositions: GeometryParserPosition[] = [];
        for (let i: int = 0; i < data.positions.length; i++) {
            const a: GeometryParserPosition = data.positions[i];
            let duplicate: Nullable<int> = null;
            for (let j: int = 0; j < cleanPositions.length; j++) {
                const b: GeometryParserPosition = cleanPositions[j];
                if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]) {
                    duplicate = j;
                }
            }
            if (duplicate === null) {
                cleanPositions.push(a);
                for (let k: int = 0; k < data.cells.length; k++) {
                    if (data.cells[k][0] === i) {
                        data.cells[k][0] = cleanPositions.length - 1;
                    }
                    if (data.cells[k][1] === i) {
                        data.cells[k][1] = cleanPositions.length - 1;
                    }
                    if (data.cells[k][2] === i) {
                        data.cells[k][2] = cleanPositions.length - 1;
                    }
                }
            } else {
                for (let k: int = 0; k < data.cells.length; k++) {
                    if (data.cells[k][0] === i) {
                        data.cells[k][0] = duplicate;
                    }
                    if (data.cells[k][1] === i) {
                        data.cells[k][1] = duplicate;
                    }
                    if (data.cells[k][2] === i) {
                        data.cells[k][2] = duplicate;
                    }
                }
            }
        }
        //log(data.positions, cleanPositions, data.cells);
        data.positions = cleanPositions;
        return data;
    }

    public static Obj(raw: string): GeometryData {
        const result: GeometryData = {} as GeometryData;
        const vertecies: float[] = [];
        const colors: float[] = [];
        const polygons: GeometryParserPolygon[] = [[0, 0, 0, 0, 0, 0]];
        const cells: GeometryParserCell[] = [];
        result.wasIndexed = false;
        GeometryParser.UnpackData(
            raw,
            polygons,
            cells,
            vertecies,
            colors,
            result
        );
        let s: GeometryWrapData;

        if (result.wasIndexed) {
            const positions: GeometryParserPosition[] = [];
            for (let i: int = 0; i < polygons.length; i++) {
                //@ts-ignore
                positions.push(polygons[i].slice(0, 3));
            }
            const wrapped = GeometryParser.WrapVertecies(
                new Float32Array(vertecies)
            );

            console.log(
                "positions",
                positions,
                "cells",
                cells,
                "wrapped.cells",
                wrapped.cells,
                "wrapped.positions",
                wrapped.positions
            );
            s = simplify(
                wrapped.cells,
                wrapped.positions
            )(Math.ceil(wrapped.positions.length * 0.5));
            console.log(s);
        }

        GeometryParser.HandleUnindexed(polygons, vertecies, colors, result);
        if (s) {
            result.vertecies = GeometryParser.UnwrapVertecies(s);
        } else {
            result.vertecies = new Float32Array(vertecies);
        }
        result.colors = new Float32Array(colors);
        result.count = result.vertecies.length / 3;
        return result;
    }

    private static UnpackData(
        raw: string,
        polygons: GeometryParserPolygon[],
        cells: GeometryParserCell[],
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
                cells,
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
        cells: GeometryParserCell[],
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
                cells,
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
            parseFloat(parts[3]) || -1,
            parseFloat(parts[4]) || -1,
            parseFloat(parts[5]) || -1,
        ]);
    }

    private static ParseKeywordF(
        parts: string[],
        polygons: GeometryParserPolygon[],
        cells: GeometryParserCell[],
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
            cells,
            vertecies,
            colors
        );
    }

    private static RegisterIndexedTriangle(
        parts: string[],
        polygons: GeometryParserPolygon[],
        cells: GeometryParserCell[],
        vertecies: float[],
        colors: float[]
    ): void {
        const a: int = parseInt(parts[0]);
        const b: int = parseInt(parts[1]);
        const c: int = parseInt(parts[2]);
        cells.push([a, b, c]);
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
