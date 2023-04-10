/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class ShaderManager {
        public readonly rootPath: string = "/base/shaders/";
        public readonly names: string[] = ["main", "shadow"];
        public readonly includes: string[] = [
            "vertexVariables",
            "vertexMethods",
            "vertexPre",
            "vertexPost",
            "fragmentVariables",
            "fragmentMethods",
            "fragmentPre",
            "fragmentShade",
            "fragmentPost",
        ];

        public readonly includeSources: MapS<string> = new MapS<string>();
        public readonly sources: MapS<WebEngine.ShaderSourcePair> =
            new MapS<WebEngine.ShaderSourcePair>();
        public readonly pairs: MapS<WebEngine.ShaderPair> =
            new MapS<WebEngine.ShaderPair>();
        public readonly programs: MapS<WebEngine.ShaderProgram> =
            new MapS<WebEngine.ShaderProgram>();

        private readonly gl: WebGL2RenderingContext;

        public constructor(gl: WebGL2RenderingContext, root?: string) {
            this.gl = gl;
            if (root) {
                this.rootPath = `${root}${this.rootPath}`;
            }
        }

        /** @internal */
        public async initialize(urls: string[]): Promise<void> {
            await this.fetchIncludeSources();
            await this.fetchShaderSources(urls);
            this.createShaders();
            this.createPrograms();
        }

        /** @internal */
        public use(name: string): WebEngine.ShaderProgram {
            const program: Nullable<WebEngine.ShaderProgram> =
                this.programs.get(name) || null;
            if (!program) {
                throw new Error(
                    "WebEngine.ShaderManager: Try to use unkown program."
                );
            }
            this.gl.useProgram(program.program);
            return program;
        }

        private async fetchIncludeSources(): Promise<void> {
            await Promise.all(
                this.includeSourceUrls().map((includeSourceUrl: string) =>
                    this.fetchIncludeSourceUrls(includeSourceUrl)
                )
            );
        }

        private includeSourceUrls(): string[] {
            const includeSourceUrls: string[] = [];
            this.includes.forEach((name, _i: int) =>
                includeSourceUrls.push(`${this.rootPath}includes/${name}.fx`)
            );
            return includeSourceUrls;
        }

        private fetchIncludeSourceUrls(
            includeSourceUrl: string
        ): Promise<void | Response> {
            return fetch(includeSourceUrl).then(async (response: Response) =>
                this.storeIncludeSource(includeSourceUrl, await response.text())
            );
        }

        private storeIncludeSource(
            includeSourceUrl: string,
            source: string
        ): void {
            const include: string = includeSourceUrl
                .split("/")
                .at(-1)!
                .split(".")[0];
            this.includeSources.set(include, source);
        }

        private async fetchShaderSources(urls: string[]): Promise<void> {
            await Promise.all(
                this.shaderSourceUrls(urls).map((sourceUrl: string) =>
                    this.fetchShaderSourceUrls(sourceUrl)
                )
            );
        }

        private shaderSourceUrls(urls: string[]): string[] {
            const shaderSourceUrls: string[] = [];
            this.names.forEach((name, _i: int) =>
                shaderSourceUrls.push(
                    `${this.rootPath}${name}.${WebEngine.ShaderTypes.VERTEX}.fx`,
                    `${this.rootPath}${name}.${WebEngine.ShaderTypes.FRAGMENT}.fx`
                )
            );
            urls.forEach((url, _i: int) => {
                shaderSourceUrls.push(
                    `${url}.${WebEngine.ShaderTypes.VERTEX}.fx`,
                    `${url}.${WebEngine.ShaderTypes.FRAGMENT}.fx`
                );
                this.names.push(url.split("/").at(-1)!);
            });
            return shaderSourceUrls;
        }

        private fetchShaderSourceUrls(
            sourceUrl: string
        ): Promise<void | Response> {
            return fetch(sourceUrl).then(async (response: Response) => {
                const shaderSourceInfo: Nullable<WebEngine.ShaderSourceInfo> =
                    this.getShaderSourceInfo(sourceUrl);
                if (!shaderSourceInfo) {
                    throw new Error(
                        "WebEngine.ShaderManager: Fetching ShaderInfo failed."
                    );
                }
                this.storeShaderSource(shaderSourceInfo, await response.text());
            });
        }

        private getShaderSourceInfo(
            sourceUrl: string
        ): Nullable<WebEngine.ShaderSourceInfo> {
            const fileInfo: Nullable<string[]> =
                sourceUrl.split("/").at(-1)?.split(".") || null;
            if (!fileInfo) {
                return null;
            }
            return {
                name: fileInfo[0],
                type:
                    fileInfo[1] === WebEngine.ShaderTypes.VERTEX
                        ? WebEngine.ShaderTypes.VERTEX
                        : WebEngine.ShaderTypes.FRAGMENT,
            } as WebEngine.ShaderSourceInfo;
        }

        private storeShaderSource(
            shaderSourceInfo: WebEngine.ShaderSourceInfo,
            source: string
        ): void {
            const sourcePair: WebEngine.ShaderSourcePair =
                this.sources.get(shaderSourceInfo.name) ||
                ({
                    [WebEngine.ShaderTypes.VERTEX]: "",
                    [WebEngine.ShaderTypes.FRAGMENT]: "",
                } as WebEngine.ShaderSourcePair);
            sourcePair[shaderSourceInfo.type] = this.preProcessSource(source);
            this.sources.set(shaderSourceInfo.name, sourcePair);
        }

        private preProcessSource(source: string): string {
            const seperator: string = "#include";
            source.split("\n").forEach((line: string, _i: int) => {
                if (line.includes(seperator)) {
                    const include: string = line
                        .split(seperator)[1]
                        .split(" ")[1]
                        .trim();
                    if (!this.includeSources.has(include)) {
                        throw new Error(
                            `WebEngine.ShaderManager: Include unknown. (${include})`
                        );
                    }
                    const includeSource: string =
                        this.includeSources.get(include)!;
                    source = source.replace(line, includeSource);
                }
            });
            return source;
        }

        private createShaders(): void {
            this.sources.forEach(
                (sourcePair: WebEngine.ShaderSourcePair, name: string) => {
                    if (this.pairs.has(name)) {
                        throw new Error(
                            "WebEngine.ShaderManager: Duplicate shader name."
                        );
                    }
                    this.pairs.set(name, {
                        [WebEngine.ShaderTypes.VERTEX]: this.createShader(
                            WebEngine.ShaderTypes.VERTEX,
                            sourcePair[WebEngine.ShaderTypes.VERTEX]
                        )!,
                        [WebEngine.ShaderTypes.FRAGMENT]: this.createShader(
                            WebEngine.ShaderTypes.FRAGMENT,
                            sourcePair[WebEngine.ShaderTypes.FRAGMENT]
                        )!,
                    } as WebEngine.ShaderPair);
                }
            );
        }

        private createPrograms(): void {
            this.pairs.forEach((pair: WebEngine.ShaderPair, name: string) =>
                this.programs.set(name, this.createShaderProgram(name, pair))
            );
        }

        private createShaderProgram(
            name: string,
            pair: WebEngine.ShaderPair
        ): WebEngine.ShaderProgram {
            const result: WebEngine.ShaderProgram =
                {} as WebEngine.ShaderProgram;
            result.program = this.createProgram(
                pair[WebEngine.ShaderTypes.VERTEX],
                pair[WebEngine.ShaderTypes.FRAGMENT]
            )!;
            result.uniformLocations =
                new WebEngine.ShaderVariableMap<WebGLUniformLocation>();
            result.instanceUniformLocations =
                new WebEngine.ShaderVariableMap<WebGLInstanceUniformLocation>();
            result.attributeLocations =
                new WebEngine.ShaderVariableMap<WebGLAttributeLocation>();
            this.registerLocations(result, name === "shadow");
            return result;
        }

        private createShader(
            type: WebEngine.ShaderTypes,
            source: string
        ): Nullable<WebGLShader> {
            const shader: Nullable<WebGLShader> = this.gl.createShader(
                type === WebEngine.ShaderTypes.VERTEX
                    ? this.gl.VERTEX_SHADER
                    : this.gl.FRAGMENT_SHADER
            );
            if (!shader) {
                throw new Error(
                    "WebEngine.ShaderManager: Shader creation failed."
                );
            }
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            const success: any = this.gl.getShaderParameter(
                shader,
                this.gl.COMPILE_STATUS
            );
            if (success) {
                return shader;
            }
            const shaderInfoLog: Nullable<string> =
                this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(
                `WebEngine.ShaderManager: Shader compilation failed. (${shaderInfoLog})`
            );
        }

        private createProgram(
            vertexShader: WebGLShader,
            fragmentShader: WebGLShader
        ): Nullable<WebGLProgram> {
            const program: Nullable<WebGLProgram> = this.gl.createProgram();
            if (!program) {
                throw new Error(
                    "WebEngine.ShaderManager: Program creation failed."
                );
            }
            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);
            this.gl.linkProgram(program);
            const success: any = this.gl.getProgramParameter(
                program,
                this.gl.LINK_STATUS
            );
            if (success) {
                return program;
            }
            const programInfoLog: Nullable<string> =
                this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error(
                `WebEngine.ShaderManager: Program creation failed. (${programInfoLog})`
            );
        }

        private registerLocations(
            shaderProgram: WebEngine.ShaderProgram,
            ignore: boolean = false
        ): void {
            this.registerUniformLocations(shaderProgram, ignore, [
                WebEngine.ShaderVariables.TIME,
                WebEngine.ShaderVariables.CAMERAPOSITION,
                WebEngine.ShaderVariables.CAMERADIRECTION,
                WebEngine.ShaderVariables.VIEWPROJECTION,
                WebEngine.ShaderVariables.SHADOWPROJECTION,
                WebEngine.ShaderVariables.AMBIENTCOLOR,
                WebEngine.ShaderVariables.LIGHTDIRECTION,
                WebEngine.ShaderVariables.LIGHTCOLOR,
                WebEngine.ShaderVariables.SHADOWMAP,
                WebEngine.ShaderVariables.SHADOWBIAS,
                WebEngine.ShaderVariables.SHADOWOPACITY,
                WebEngine.ShaderVariables.SHADOWMAPSIZE,
            ]);
            this.registerInstanceUniformLocations(shaderProgram, ignore, [
                WebEngine.ShaderVariables.OBJECTWORLD,
            ]);
            this.registerAttributeLocations(shaderProgram, ignore, [
                WebEngine.ShaderVariables.VERTEXPOSITION,
                WebEngine.ShaderVariables.VERTEXCOLOR,
            ]);
        }

        private registerUniformLocations(
            shaderProgram: WebEngine.ShaderProgram,
            ignore: boolean = false,
            names: WebEngine.ShaderVariables[]
        ): void {
            names.forEach((name: WebEngine.ShaderVariables, _i: int) =>
                this.registerUniformLocation(shaderProgram, name, ignore)
            );
        }

        private registerUniformLocation(
            shaderProgram: WebEngine.ShaderProgram,
            name: WebEngine.ShaderVariables,
            ignore: boolean = false
        ): void {
            const uniformLocation: Nullable<WebGLUniformLocation> =
                this.gl.getUniformLocation(shaderProgram.program, name);
            if (!uniformLocation && ignore) {
                return;
            }
            if (!uniformLocation) {
                throw new Error(
                    `WebEngine.ShaderManager: Fetching uniform location failed. (${name})`
                );
            }
            shaderProgram.uniformLocations.set(name, uniformLocation);
        }

        private registerInstanceUniformLocations(
            shaderProgram: WebEngine.ShaderProgram,
            ignore: boolean = false,
            names: WebEngine.ShaderVariables[]
        ): void {
            names.forEach((name: WebEngine.ShaderVariables, _i: int) =>
                this.registerInstanceUniformLocation(
                    shaderProgram,
                    name,
                    ignore
                )
            );
        }

        private registerInstanceUniformLocation(
            shaderProgram: WebEngine.ShaderProgram,
            name: WebEngine.ShaderVariables,
            ignore: boolean = false
        ): void {
            const instanceUniformLocation: WebGLInstanceUniformLocation =
                this.gl.getAttribLocation(shaderProgram.program, name);
            if (instanceUniformLocation === -1 && ignore) {
                return;
            }
            if (instanceUniformLocation === -1) {
                throw new Error(
                    `WebEngine.ShaderManager: Fetching instance uniform location failed. (${name})`
                );
            }
            shaderProgram.instanceUniformLocations.set(
                name,
                instanceUniformLocation
            );
        }

        private registerAttributeLocations(
            shaderProgram: WebEngine.ShaderProgram,
            ignore: boolean = false,
            names: WebEngine.ShaderVariables[]
        ): void {
            names.forEach((name: WebEngine.ShaderVariables, _i: int) =>
                this.registerAttributeLocation(shaderProgram, name, ignore)
            );
        }

        private registerAttributeLocation(
            shaderProgram: WebEngine.ShaderProgram,
            name: WebEngine.ShaderVariables,
            ignore: boolean = false
        ): void {
            const attributeLocation: WebGLAttributeLocation =
                this.gl.getAttribLocation(shaderProgram.program, name);
            if (attributeLocation === -1 && ignore) {
                return;
            }
            if (attributeLocation === -1) {
                throw new Error(
                    `WebEngine.ShaderManager: Fetching attribute location failed. (${name})`
                );
            }
            shaderProgram.attributeLocations.set(name, attributeLocation);
        }
    }
}
