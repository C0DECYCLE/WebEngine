/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryWrapper {
    public static Unwrap(data: GeometryWrapData): Float32Array {
        const vertecies: Float32Array = new Float32Array(
            data.cells.length * 3 * 3
        );
        for (let i: int = 0; i < data.cells.length; i++) {
            const cell: GeometryCell = data.cells[i];
            for (let j: int = 0; j < 3; j++) {
                const index: int = i * 3 + j;
                const position: GeometryPosition = data.positions[cell[j]];
                for (let k: int = 0; k < 3; k++) {
                    vertecies[index * 3 + k] = position[k];
                }
            }
        }
        return vertecies;
    }

    public static Wrap(vertecies: Float32Array): GeometryWrapData {
        const data: GeometryWrapData = {
            positions: [],
            cells: [],
        } as GeometryWrapData;
        for (let i: int = 0; i < vertecies.length / (3 * 3); i++) {
            const cell: GeometryCell = [i * 3, i * 3 + 1, i * 3 + 2];
            data.cells.push(cell);
        }
        for (let i: int = 0; i < vertecies.length / 3; i++) {
            const position: GeometryPosition = [
                vertecies[i * 3],
                vertecies[i * 3 + 1],
                vertecies[i * 3 + 2],
            ];
            data.positions.push(position);
        }
        return GeometryWrapper.Uniquify(data);
    }

    private static Uniquify(data: GeometryWrapData): GeometryWrapData {
        const uniques: GeometryPosition[] = [];
        for (let i: int = 0; i < data.positions.length; i++) {
            const candidate: GeometryPosition = data.positions[i];
            const duplicate: Nullable<int> = GeometryWrapper.FindDuplicate(
                uniques,
                candidate
            );
            if (duplicate === null) {
                GeometryWrapper.ReplaceMatching(data.cells, i, uniques.length);
                uniques.push(candidate);
            } else {
                GeometryWrapper.ReplaceMatching(data.cells, i, duplicate);
            }
        }
        data.positions = uniques;
        return data;
    }

    private static FindDuplicate(
        uniques: GeometryPosition[],
        candidate: GeometryPosition
    ): Nullable<int> {
        for (let i: int = 0; i < uniques.length; i++) {
            const unique: GeometryPosition = uniques[i];
            if (
                candidate[0] === unique[0] &&
                candidate[1] === unique[1] &&
                candidate[2] === unique[2]
            ) {
                return i;
            }
        }
        return null;
    }

    private static ReplaceMatching(
        cells: GeometryCell[],
        match: int,
        replace: int
    ): void {
        for (let i: int = 0; i < cells.length; i++) {
            if (cells[i][0] === match) {
                cells[i][0] = replace;
            }
            if (cells[i][1] === match) {
                cells[i][1] = replace;
            }
            if (cells[i][2] === match) {
                cells[i][2] = replace;
            }
        }
    }
}
