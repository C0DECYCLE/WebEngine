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
    }

    public draw(): void {
        this.lods.forEach((lod: GeometryLod, _level: int) => lod.draw());
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
        [1, 0.1, 0.5] as GeometryLodConfig,
        [2, 0.05, 0.25] as GeometryLodConfig,
        [3, 0.01, 0.1] as GeometryLodConfig,
    ];
}