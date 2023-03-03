/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class GeometryManager {
    public readonly rootPath: string = "/engine/geometries/";
    public readonly names: string[] = [
        "plane",
        "cube",
        "icosphere",
        "f",
        "torus",
    ];

    public readonly datas: MapS<GeometryData> = new MapS<GeometryData>();
    public readonly list: MapS<Geometry> = new MapS<Geometry>();

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public async initialize(names: string[]): Promise<void> {
        this.names.push(...names);
        await this.fetchObjFiles();
        this.createGeometries();
    }

    private async fetchObjFiles(): Promise<void> {
        await Promise.all(
            this.objFileUrls().map((fileUrl: string) =>
                this.fetchObjFile(fileUrl)
            )
        );
    }

    private objFileUrls(): string[] {
        const objFileUrls: string[] = [];
        this.names.forEach((name) =>
            objFileUrls.push(`${this.rootPath}${name}.obj`)
        );
        return objFileUrls;
    }

    private fetchObjFile(fileUrl: string): Promise<void | Response> {
        return fetch(fileUrl).then(async (response: Response) => {
            const data = this.parseObjData(await response.text());
            this.datas.set(this.getNameFromFileUrl(fileUrl), data);
        });
    }

    private parseObjData(data: string): GeometryData {
        const lines: string[] = data.split("\n");
        const result: GeometryData = {} as GeometryData;
        const vertecies: float[] = [];

        lines.forEach((line: string) => {
            const prefix: string = line[0];
            const content: string = line.slice(2, line.length);

            if (prefix === "o") {
                result.name = content;
            } else if (prefix === "v") {
                vertecies.push(
                    ...content.split(" ").map((value) => Number(value))
                );
            }
        });
        result.vertecies = new Float32Array(vertecies);
        return result;
    }

    private getNameFromFileUrl(fileUrl: string): string {
        return fileUrl.split(".obj")[0].split("/").at(-1)!;
    }

    private createGeometries(): void {
        this.datas.forEach((data: GeometryData, name: string) =>
            this.list.set(name, new Geometry(this.gl, data))
        );
    }
}
