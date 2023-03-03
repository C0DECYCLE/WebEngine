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

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public async initialize(names: string[]): Promise<void> {
        this.names.push(...names);
        await this.fetchObjFiles();
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
        for (let i: int = 0; i < this.names.length; i++) {
            objFileUrls.push(`${this.rootPath}${this.names[i]}.obj`);
        }
        return objFileUrls;
    }

    private fetchObjFile(fileUrl: string): Promise<void | Response> {
        return fetch(fileUrl).then(async (response) => {
            const data = this.parseObjData(await response.text());
            this.datas.set(this.getNameFromFileUrl(fileUrl), data);
        });
    }

    private parseObjData(data: string): GeometryData {
        const lines: string[] = data.split("\n");
        const result: GeometryData = {} as GeometryData;
        const vertecies: float[] = [];

        for (let i: int = 0; i < lines.length; i++) {
            const prefix: string = lines[i][0];
            const content: string = lines[i].slice(2, lines[i].length);

            if (prefix === "o") {
                result.name = content;
            } else if (prefix === "v") {
                vertecies.push(
                    ...content.split(" ").map((value) => Number(value))
                );
            } else {
                continue;
            }
        }
        result.vertecies = new Float32Array(vertecies);
        return result;
    }

    private getNameFromFileUrl(fileUrl: string): string {
        return fileUrl.split(".obj")[0].split("/").at(-1)!;
    }
}
