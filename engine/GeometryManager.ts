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
        "suzanne"
    ];

    public readonly datas: MapS<GeometryData> = new MapS<GeometryData>();
    public readonly list: MapS<Geometry> = new MapS<Geometry>();

    private readonly gl: WebGL2RenderingContext;
    private shaderManager: ShaderManager;

    public constructor(
        gl: WebGL2RenderingContext,
        shaderManager: ShaderManager
    ) {
        this.gl = gl;
        this.shaderManager = shaderManager;
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
        const result: GeometryData = {} as GeometryData;
        /*
        const lines: string[] = data.split("\n");
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
        */

        // because indices are base 1 let's just fill in the 0th data
        const objPositions = [[0, 0, 0]];

        // same order as `f` indices
        const objVertexData = [objPositions];

        // same order as `f` indices
        let webglVertexData = [
            [], // positions
        ];

        function addVertex(vert) {
            const ptn = vert.split("/");
            ptn.forEach((objIndexStr, i) => {
                if (!objIndexStr) {
                    return;
                }
                const objIndex = parseInt(objIndexStr);
                const index =
                    objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                webglVertexData[i].push(...objVertexData[i][index]);
            });
        }

        let isIndexed = false;

        const keywords = {
            o(parts) {
                log(parts);
            },
            v(parts) {
                parts = parts.slice(0, 3);
                objPositions.push(parts.map(parseFloat));
            },
            s(parts) {
                log(parts);
            }
            f(parts) {
                isIndexed = true;
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = data.split("\n");
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === "" || line.startsWith("#")) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
                console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
                continue;
            }
            handler(parts, unparsedArgs);
        }

        if (isIndexed === false) {
            for (let i = 1; i < objPositions.length; i++) {
                webglVertexData[0].push(...objPositions[i]);
            }
        }
        /*
        return {
            position: webglVertexData[0],
            texcoord: webglVertexData[1],
            normal: webglVertexData[2],
        };
        */
        ////////////////////////////////////////////////////////////
        log(webglVertexData);

        result.vertecies = new Float32Array(webglVertexData[0]);
        result.count = result.vertecies.length / 3;

        result.shader = "main";
        result.capacity = 10;

        if (!this.shaderManager.names.includes(result.shader)) {
            throw new Error(`Renderer: Shader unknown. (${result.shader})`);
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
        return new Geometry(this.gl, data, program);
    }
}
