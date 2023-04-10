/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class GeometryManager {
        public readonly rootPath: string = "/base/models/";
        public readonly names: string[] = [
            "cube",
            "sphere",
            "icosphere",
            "torus",
            "suzanne",
        ];

        public readonly datas: MapS<WebEngine.GeometryData> =
            new MapS<WebEngine.GeometryData>();
        public list: MapS<WebEngine.Geometry> = new MapS<WebEngine.Geometry>();

        private readonly gl: WebGL2RenderingContext;
        private readonly shaderManager: WebEngine.ShaderManager;
        private readonly stats: WebEngine.Stats;

        public constructor(
            gl: WebGL2RenderingContext,
            shaderManager: WebEngine.ShaderManager,
            stats: WebEngine.Stats,
            root?: string
        ) {
            this.gl = gl;
            this.shaderManager = shaderManager;
            this.stats = stats;
            if (root) {
                this.rootPath = `${root}${this.rootPath}`;
            }
        }

        /** @internal */
        public getStats(): WebEngine.Stats {
            return this.stats;
        }

        /** @internal */
        public async initialize(
            urls: string[],
            lodMatrix: WebEngine.GeometryLodConfig[]
        ): Promise<void> {
            await this.fetchObjFiles(urls, lodMatrix);
            this.createGeometries();
        }

        private async fetchObjFiles(
            urls: string[],
            lodMatrix: WebEngine.GeometryLodConfig[]
        ): Promise<void> {
            await Promise.all(
                this.objFileUrls(urls).map((fileUrl: string) =>
                    this.fetchObjFile(fileUrl, lodMatrix)
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

        private fetchObjFile(
            fileUrl: string,
            lodMatrix: WebEngine.GeometryLodConfig[]
        ): Promise<void | Response> {
            return fetch(fileUrl).then(async (response: Response) => {
                const fileName: string = this.getNameFromFileUrl(fileUrl);
                const data: WebEngine.GeometryData = this.parseObjData(
                    await response.text(),
                    lodMatrix
                );
                if (this.datas.has(fileName)) {
                    throw new Error(
                        "WebEngine.GeometryManager: Duplicate geometry name."
                    );
                }
                this.datas.set(fileName, data);
            });
        }

        private parseObjData(
            data: string,
            lodMatrix: WebEngine.GeometryLodConfig[]
        ): WebEngine.GeometryData {
            const result: WebEngine.GeometryData = WebEngine.GeometryParser.Obj(
                data,
                lodMatrix
            );
            if (!this.shaderManager.names.includes(result.shader)) {
                throw new Error(
                    `WebEngine.GeometryManager: Shader unknown. (${result.shader})`
                );
            }
            return result;
        }

        private getNameFromFileUrl(fileUrl: string): string {
            return fileUrl.split(".obj")[0].split("/").at(-1)!;
        }

        private createGeometries(): void {
            this.datas.forEach((data: WebEngine.GeometryData, name: string) =>
                this.list.set(name, this.createGeometry(data))
            );
            this.list = new Map(
                [...this.list].sort(
                    (
                        a: [string, WebEngine.Geometry],
                        b: [string, WebEngine.Geometry]
                    ) => {
                        const shaderA: string = a[1].data.shader;
                        const shaderB: string = b[1].data.shader;
                        return shaderA < shaderB
                            ? -1
                            : shaderA > shaderB
                            ? 1
                            : 0;
                    }
                )
            );
        }

        private createGeometry(
            data: WebEngine.GeometryData
        ): WebEngine.Geometry {
            const program: WebEngine.ShaderProgram =
                this.shaderManager.programs.get(data.shader)!;
            return new WebEngine.Geometry(this.gl, data, program, this);
        }
    }
}
