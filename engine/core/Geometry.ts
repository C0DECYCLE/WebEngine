/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Geometry {
    public readonly data: GeometryData;
    public readonly program: ShaderProgram;
    public readonly geometryManager: GeometryManager;

    private readonly gl: WebGL2RenderingContext;
    private readonly lods: Map<int, GeometryLod> = new Map<int, GeometryLod>();

    private instanceCount: int = 0;

    public constructor(
        gl: WebGL2RenderingContext,
        data: GeometryData,
        program: ShaderProgram,
        geometryManager: GeometryManager
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

    public storeInstance(mat: Mat4, lod: int): void {
        if (lod === -1) {
            return;
        }
        if (!this.lods.has(lod)) {
            return warn(
                `Geometry: Lod level not available on geometry. (${this.data.name}, ${lod})`
            );
        }
        this.lods.get(lod)?.storeInstance(mat);
        this.instanceCount++;
    }

    public draw(): void {
        this.lods.forEach((lod: GeometryLod, _level: int) => lod.draw());
        this.geometryManager
            .getStats()
            .incrementTotalVertecies(
                this.data.lods[0].count * this.instanceCount
            );
        this.instanceCount = 0;
    }

    private create(): void {
        this.data.lods.forEach((dataLod: GeometryDataLod, _i: int) =>
            this.createLod(dataLod)
        );
    }

    private createLod(dataLod: GeometryDataLod): void {
        this.lods.set(dataLod.level, new GeometryLod(this.gl, dataLod, this));
    }

    public static readonly LodMatrix: GeometryLodConfig[] = [
        //level, coverage minimum, simplify percentage
        [0, 0.25, 1.0] as GeometryLodConfig,
        [1, 0.1, 0.75 /*0.5*/] as GeometryLodConfig,
        [2, 0.05, 0.5 /*0.25*/] as GeometryLodConfig,
        [3, 0.01, 0.25 /*0.1*/] as GeometryLodConfig,
    ];
}
