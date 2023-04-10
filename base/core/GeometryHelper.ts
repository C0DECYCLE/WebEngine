/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class GeometryHelper {
        public static ComputeBounds(
            positions: Float32Array
        ): WebEngine.GeometryBounds {
            const min: Vec3 = new Vec3();
            const max: Vec3 = new Vec3();
            for (let i: int = 0; i < positions.length / 3; i++) {
                const position: Vec3 = new Vec3(
                    positions[i * 3],
                    positions[i * 3 + 1],
                    positions[i * 3 + 2]
                );
                WebEngine.GeometryHelper.MinBound(min, position);
                WebEngine.GeometryHelper.MaxBound(max, position);
            }
            return {
                min: min,
                max: max,
                size: max.clone().sub(min).length(),
            } as WebEngine.GeometryBounds;
        }

        public static UnifyColors(
            colors: Float32Array,
            color: WebEngine.GeometryColor
        ): void {
            for (let i = 0; i < colors.length / 3; i++) {
                colors[i * 3] = color[0];
                colors[i * 3 + 1] = color[1];
                colors[i * 3 + 2] = color[2];
            }
        }

        public static FlattenColors(colors: Float32Array): Float32Array {
            for (let i: int = 0; i < colors.length / (3 * 3); i++) {
                //@ts-ignore
                const face: WebEngine.GeometryFace<WebEngine.GeometryColor> =
                    [];
                for (let j: int = 0; j < 3; j++) {
                    face[j] = [
                        colors[i * (3 * 3) + 3 * j + 0],
                        colors[i * (3 * 3) + 3 * j + 1],
                        colors[i * (3 * 3) + 3 * j + 2],
                    ] as WebEngine.GeometryColor;
                }
                if (!WebEngine.GeometryHelper.EqualFace(face)) {
                    WebEngine.GeometryHelper.FlattenFace(colors, face, i);
                }
            }
            return colors;
        }

        public static EqualFace(
            face: WebEngine.GeometryFace<
                WebEngine.GeometryPosition | WebEngine.GeometryColor
            >
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
            face: WebEngine.GeometryFace<WebEngine.GeometryColor>,
            offset: int
        ): void {
            const provoking: WebEngine.GeometryColor = face.sort(
                (a: WebEngine.GeometryColor, b: WebEngine.GeometryColor) =>
                    a[0] + a[1] + a[2] - (b[0] + b[1] + b[2])
            )[0];
            for (let i: int = 0; i < 3; i++) {
                data[offset * (3 * 3) + 3 * i + 0] = provoking[0];
                data[offset * (3 * 3) + 3 * i + 1] = provoking[1];
                data[offset * (3 * 3) + 3 * i + 2] = provoking[2];
            }
        }

        private static MinBound(min: Vec3, position: Vec3): void {
            if (min.x > position.x) {
                min.x = position.x;
            }
            if (min.y > position.y) {
                min.y = position.y;
            }
            if (min.z > position.z) {
                min.z = position.z;
            }
        }

        private static MaxBound(max: Vec3, position: Vec3): void {
            if (max.x < position.x) {
                max.x = position.x;
            }
            if (max.y < position.y) {
                max.y = position.y;
            }
            if (max.z < position.z) {
                max.z = position.z;
            }
        }
    }
}
