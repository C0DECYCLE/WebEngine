/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryManager {
    public readonly rootPath: string = "/engine/models/";
    public readonly names: string[] = [
        "cube",
        "sphere",
        "icosphere",
        "torus",
        "suzanne",
    ];

    public readonly datas: MapS<GeometryData> = new MapS<GeometryData>();
    public readonly list: MapS<Geometry> = new MapS<Geometry>();

    private readonly gl: WebGL2RenderingContext;
    private readonly shaderManager: ShaderManager;
    private readonly stats: Stats;

    public constructor(
        gl: WebGL2RenderingContext,
        shaderManager: ShaderManager,
        stats: Stats
    ) {
        this.gl = gl;
        this.shaderManager = shaderManager;
        this.stats = stats;
    }

    public async initialize(urls: string[]): Promise<void> {
        await this.fetchObjFiles(urls);
        this.createGeometries();
    }

    public getStats(): Stats {
        return this.stats;
    }

    private async fetchObjFiles(urls: string[]): Promise<void> {
        await Promise.all(
            this.objFileUrls(urls).map((fileUrl: string) =>
                this.fetchObjFile(fileUrl)
            )
        );
    }

    private objFileUrls(urls: string[]): string[] {
        const objFileUrls: string[] = [];
        this.names.forEach((name, _i: int) =>
            objFileUrls.push(`${this.rootPath}${name}.obj`)
        );
        objFileUrls.push(...urls);
        return objFileUrls;
    }

    private fetchObjFile(fileUrl: string): Promise<void | Response> {
        return fetch(fileUrl).then(async (response: Response) => {
            const fileName: string = this.getNameFromFileUrl(fileUrl);
            const data: GeometryData = this.parseObjData(await response.text());
            if (this.datas.has(fileName)) {
                throw new Error("GeometryManager: Duplicate geometry name.");
            }
            this.datas.set(fileName, data);
        });
    }

    private parseObjData(data: string): GeometryData {
        const result: GeometryData = GeometryParser.Obj(data);
        if (!this.shaderManager.names.includes(result.shader)) {
            throw new Error(
                `GeometryManager: Shader unknown. (${result.shader})`
            );
        }
        return result;
    }

    private getNameFromFileUrl(fileUrl: string): string {
        return fileUrl.split(".obj")[0].split("/").at(-1)!;
    }

    private createGeometries(): void {
        this.datas.forEach((data: GeometryData, name: string) =>
            this.list.set(name, this.createGeometry(data))
        );
    }

    private createGeometry(data: GeometryData): Geometry {
        const program: ShaderProgram = this.shaderManager.programs.get(
            data.shader
        )!;
        return new Geometry(this.gl, data, program, this);
    }
}
