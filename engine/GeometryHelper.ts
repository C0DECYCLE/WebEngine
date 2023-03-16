/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryHelper {
    public static FlattenColors(colors: Float32Array): Float32Array {
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
            if (!GeometryHelper.EqualFace(face)) {
                GeometryHelper.FlattenFace(colors, face, i);
            }
        }
        return colors;
    }

    public static EqualFace(
        face: GeometryFace<GeometryPosition | GeometryColor>
    ): boolean {
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
