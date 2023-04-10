/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class Geometry {
        public readonly data: WebEngine.GeometryData;
        public readonly program: WebEngine.ShaderProgram;
        public readonly geometryManager: WebEngine.GeometryManager;

        private readonly gl: WebGL2RenderingContext;
        private readonly lods: Map<int, WebEngine.GeometryLod> = new Map<
            int,
            WebEngine.GeometryLod
        >();

        private instanceCount: int = 0;

        public constructor(
            gl: WebGL2RenderingContext,
            data: WebEngine.GeometryData,
            program: WebEngine.ShaderProgram,
            geometryManager: WebEngine.GeometryManager
        ) {
            this.gl = gl;
            this.data = data;
            this.program = program;
            this.geometryManager = geometryManager;
            this.create();
        }

        public hasLod(lod: int): boolean {
            return this.lods.has(lod);
        }

        /** @internal */
        public storeInstance(mat: Mat4, lod: int): void {
            if (lod === -1) {
                return;
            }
            if (!this.lods.has(lod)) {
                return warn(
                    `WebEngine.Geometry: Lod level not available on geometry. (${this.data.name}, ${lod})`
                );
            }
            this.lods.get(lod)?.storeInstance(mat);
            this.instanceCount++;
        }

        /** @internal */
        public draw(isShadow: boolean): void {
            this.lods.forEach((lod: WebEngine.GeometryLod, _level: int) =>
                lod.draw(isShadow)
            );
            this.registerStats(
                isShadow,
                this.data.lods[0].count * this.instanceCount
            );
            this.instanceCount = 0;
        }

        private create(): void {
            this.data.lods.forEach(
                (dataLod: WebEngine.GeometryDataLod, _i: int) =>
                    this.createLod(dataLod)
            );
        }

        private createLod(dataLod: WebEngine.GeometryDataLod): void {
            this.lods.set(
                dataLod.level,
                new WebEngine.GeometryLod(this.gl, dataLod, this)
            );
        }

        private registerStats(isShadow: boolean, n: int): void {
            if (isShadow) {
                this.geometryManager.getStats().add("totalShadowVertecies", n);
            } else {
                this.geometryManager.getStats().add("totalVertecies", n);
            }
        }

        public static readonly LodMatrix: WebEngine.GeometryLodConfig[] = [
            //level, coverage minimum, simplify percentage
            [0, 0.25, 1.0] as WebEngine.GeometryLodConfig,
            [1, 0.1, 0.75 /*0.5*/] as WebEngine.GeometryLodConfig,
            [2, 0.05, 0.5 /*0.25*/] as WebEngine.GeometryLodConfig,
            [3, 0.01, 0.25 /*0.1*/] as WebEngine.GeometryLodConfig,
        ];
    }
}
