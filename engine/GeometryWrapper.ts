/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryWrapper {
    /*
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
    */
    /*
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
    */
}
