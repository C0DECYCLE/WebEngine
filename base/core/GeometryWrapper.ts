/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class GeometryWrapper {
        public static Unwrap(
            data: WebEngine.GeometryWrapData
        ): WebEngine.GeometryUnwrapData {
            const length: int = data.cells.length * 3 * 3;
            const positions: Float32Array = new Float32Array(length);
            const colors: Float32Array = new Float32Array(length);
            for (let i: int = 0; i < data.cells.length; i++) {
                const cell: WebEngine.GeometryCell = data.cells[i];
                for (let j: int = 0; j < 3; j++) {
                    const index: int = i * 3 + j;
                    const position: WebEngine.GeometryPosition =
                        data.positions[cell[j]];
                    const color: WebEngine.GeometryColor = data.colors[cell[j]];
                    for (let k: int = 0; k < 3; k++) {
                        positions[index * 3 + k] = position[k];
                        colors[index * 3 + k] = color[k];
                    }
                }
            }
            return {
                positions: positions,
                colors: colors,
            } as WebEngine.GeometryUnwrapData;
        }

        public static Wrap(
            data: WebEngine.GeometryUnwrapData
        ): WebEngine.GeometryWrapData {
            const result: WebEngine.GeometryWrapData = {
                positions: [],
                colors: [],
                cells: [],
            } as WebEngine.GeometryWrapData;
            for (let i: int = 0; i < data.positions.length / (3 * 3); i++) {
                const cell: WebEngine.GeometryCell = [
                    i * 3,
                    i * 3 + 1,
                    i * 3 + 2,
                ];
                result.cells.push(cell);
            }
            for (let i: int = 0; i < data.positions.length / 3; i++) {
                result.positions.push([
                    data.positions[i * 3],
                    data.positions[i * 3 + 1],
                    data.positions[i * 3 + 2],
                ] as WebEngine.GeometryPosition);
                result.colors.push([
                    data.colors[i * 3],
                    data.colors[i * 3 + 1],
                    data.colors[i * 3 + 2],
                ] as WebEngine.GeometryColor);
            }
            return WebEngine.GeometryWrapper.Uniquify(result);
        }

        private static Uniquify(
            data: WebEngine.GeometryWrapData
        ): WebEngine.GeometryWrapData {
            const uniques: WebEngine.GeometryPosition[] = [];
            const colors: WebEngine.GeometryColor[] = [];
            for (let i: int = 0; i < data.positions.length; i++) {
                const candidate: WebEngine.GeometryPosition = data.positions[i];
                const duplicate: Nullable<int> =
                    WebEngine.GeometryWrapper.FindDuplicate(uniques, candidate);
                if (duplicate === null) {
                    WebEngine.GeometryWrapper.ReplaceMatching(
                        data.cells,
                        i,
                        uniques.length
                    );
                    uniques.push(candidate);
                    colors.push(data.colors[i]);
                } else {
                    WebEngine.GeometryWrapper.ReplaceMatching(
                        data.cells,
                        i,
                        duplicate
                    );
                }
            }
            data.positions = uniques;
            data.colors = colors;
            return data;
        }

        private static FindDuplicate(
            uniques: WebEngine.GeometryPosition[],
            candidate: WebEngine.GeometryPosition
        ): Nullable<int> {
            for (let i: int = 0; i < uniques.length; i++) {
                const unique: WebEngine.GeometryPosition = uniques[i];
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
            cells: WebEngine.GeometryCell[],
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
}
