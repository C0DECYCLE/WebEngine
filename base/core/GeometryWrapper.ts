/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryWrapper {
    public static Unwrap(data: GeometryWrapData): GeometryUnwrapData {
        const length: int = data.cells.length * 3 * 3;
        const positions: Float32Array = new Float32Array(length);
        const colors: Float32Array = new Float32Array(length);
        for (let i: int = 0; i < data.cells.length; i++) {
            const cell: GeometryCell = data.cells[i];
            for (let j: int = 0; j < 3; j++) {
                const index: int = i * 3 + j;
                const position: GeometryPosition = data.positions[cell[j]];
                const color: GeometryColor = data.colors[cell[j]];
                for (let k: int = 0; k < 3; k++) {
                    positions[index * 3 + k] = position[k];
                    colors[index * 3 + k] = color[k];
                }
            }
        }
        return {
            positions: positions,
            colors: colors,
        } as GeometryUnwrapData;
    }

    public static Wrap(data: GeometryUnwrapData): GeometryWrapData {
        const result: GeometryWrapData = {
            positions: [],
            colors: [],
            cells: [],
        } as GeometryWrapData;
        for (let i: int = 0; i < data.positions.length / (3 * 3); i++) {
            const cell: GeometryCell = [i * 3, i * 3 + 1, i * 3 + 2];
            result.cells.push(cell);
        }
        for (let i: int = 0; i < data.positions.length / 3; i++) {
            result.positions.push([
                data.positions[i * 3],
                data.positions[i * 3 + 1],
                data.positions[i * 3 + 2],
            ] as GeometryPosition);
            result.colors.push([
                data.colors[i * 3],
                data.colors[i * 3 + 1],
                data.colors[i * 3 + 2],
            ] as GeometryColor);
        }
        return GeometryWrapper.Uniquify(result);
    }

    private static Uniquify(data: GeometryWrapData): GeometryWrapData {
        const uniques: GeometryPosition[] = [];
        const colors: GeometryColor[] = [];
        for (let i: int = 0; i < data.positions.length; i++) {
            const candidate: GeometryPosition = data.positions[i];
            const duplicate: Nullable<int> = GeometryWrapper.FindDuplicate(
                uniques,
                candidate
            );
            if (duplicate === null) {
                GeometryWrapper.ReplaceMatching(data.cells, i, uniques.length);
                uniques.push(candidate);
                colors.push(data.colors[i]);
            } else {
                GeometryWrapper.ReplaceMatching(data.cells, i, duplicate);
            }
        }
        data.positions = uniques;
        data.colors = colors;
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
