/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class ShaderManager {
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
    public readonly sources: MapS<ShaderSourcePair> =
        new MapS<ShaderSourcePair>();
    public readonly pairs: MapS<ShaderPair> = new MapS<ShaderPair>();
    public readonly programs: MapS<ShaderProgram> = new MapS<ShaderProgram>();

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
    public use(name: string): ShaderProgram {
        const program: Nullable<ShaderProgram> =
            this.programs.get(name) || null;
        if (!program) {
            throw new Error("ShaderManager: Try to use unkown program.");
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

    private storeIncludeSource(includeSourceUrl: string, source: string): void {
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
                `${this.rootPath}${name}.${ShaderTypes.VERTEX}.fx`,
                `${this.rootPath}${name}.${ShaderTypes.FRAGMENT}.fx`
            )
        );
        urls.forEach((url, _i: int) => {
            shaderSourceUrls.push(
                `${url}.${ShaderTypes.VERTEX}.fx`,
                `${url}.${ShaderTypes.FRAGMENT}.fx`
            );
            this.names.push(url.split("/").at(-1)!);
        });
        return shaderSourceUrls;
    }

    private fetchShaderSourceUrls(sourceUrl: string): Promise<void | Response> {
        return fetch(sourceUrl).then(async (response: Response) => {
            const shaderSourceInfo: Nullable<ShaderSourceInfo> =
                this.getShaderSourceInfo(sourceUrl);
            if (!shaderSourceInfo) {
                throw new Error("ShaderManager: Fetching ShaderInfo failed.");
            }
            this.storeShaderSource(shaderSourceInfo, await response.text());
        });
    }

    private getShaderSourceInfo(sourceUrl: string): Nullable<ShaderSourceInfo> {
        const fileInfo: Nullable<string[]> =
            sourceUrl.split("/").at(-1)?.split(".") || null;
        if (!fileInfo) {
            return null;
        }
        return {
            name: fileInfo[0],
            type:
                fileInfo[1] === ShaderTypes.VERTEX
                    ? ShaderTypes.VERTEX
                    : ShaderTypes.FRAGMENT,
        } as ShaderSourceInfo;
    }

    private storeShaderSource(
        shaderSourceInfo: ShaderSourceInfo,
        source: string
    ): void {
        const sourcePair: ShaderSourcePair =
            this.sources.get(shaderSourceInfo.name) ||
            ({
                [ShaderTypes.VERTEX]: "",
                [ShaderTypes.FRAGMENT]: "",
            } as ShaderSourcePair);
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
                        `ShaderManager: Include unknown. (${include})`
                    );
                }
                const includeSource: string = this.includeSources.get(include)!;
                source = source.replace(line, includeSource);
            }
        });
        return source;
    }

    private createShaders(): void {
        this.sources.forEach((sourcePair: ShaderSourcePair, name: string) => {
            if (this.pairs.has(name)) {
                throw new Error("ShaderManager: Duplicate shader name.");
            }
            this.pairs.set(name, {
                [ShaderTypes.VERTEX]: this.createShader(
                    ShaderTypes.VERTEX,
                    sourcePair[ShaderTypes.VERTEX]
                )!,
                [ShaderTypes.FRAGMENT]: this.createShader(
                    ShaderTypes.FRAGMENT,
                    sourcePair[ShaderTypes.FRAGMENT]
                )!,
            } as ShaderPair);
        });
    }

    private createPrograms(): void {
        this.pairs.forEach((pair: ShaderPair, name: string) =>
            this.programs.set(name, this.createShaderProgram(name, pair))
        );
    }

    private createShaderProgram(name: string, pair: ShaderPair): ShaderProgram {
        const result: ShaderProgram = {} as ShaderProgram;
        result.program = this.createProgram(
            pair[ShaderTypes.VERTEX],
            pair[ShaderTypes.FRAGMENT]
        )!;
        result.uniformLocations = new ShaderVariableMap<WebGLUniformLocation>();
        result.instanceUniformLocations =
            new ShaderVariableMap<WebGLInstanceUniformLocation>();
        result.attributeLocations =
            new ShaderVariableMap<WebGLAttributeLocation>();
        this.registerLocations(result, name === "shadow");
        return result;
    }

    private createShader(
        type: ShaderTypes,
        source: string
    ): Nullable<WebGLShader> {
        const shader: Nullable<WebGLShader> = this.gl.createShader(
            type === ShaderTypes.VERTEX
                ? this.gl.VERTEX_SHADER
                : this.gl.FRAGMENT_SHADER
        );
        if (!shader) {
            throw new Error("ShaderManager: Shader creation failed.");
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
            `ShaderManager: Shader compilation failed. (${shaderInfoLog})`
        );
    }

    private createProgram(
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader
    ): Nullable<WebGLProgram> {
        const program: Nullable<WebGLProgram> = this.gl.createProgram();
        if (!program) {
            throw new Error("ShaderManager: Program creation failed.");
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
            `ShaderManager: Program creation failed. (${programInfoLog})`
        );
    }

    private registerLocations(
        shaderProgram: ShaderProgram,
        ignore: boolean = false
    ): void {
        this.registerUniformLocations(shaderProgram, ignore, [
            ShaderVariables.TIME,
            ShaderVariables.CAMERAPOSITION,
            ShaderVariables.CAMERADIRECTION,
            ShaderVariables.VIEWPROJECTION,
            ShaderVariables.SHADOWPROJECTION,
            ShaderVariables.AMBIENTCOLOR,
            ShaderVariables.LIGHTDIRECTION,
            ShaderVariables.LIGHTCOLOR,
            ShaderVariables.SHADOWMAP,
            ShaderVariables.SHADOWBIAS,
            ShaderVariables.SHADOWOPACITY,
            ShaderVariables.SHADOWMAPSIZE,
        ]);
        this.registerInstanceUniformLocations(shaderProgram, ignore, [
            ShaderVariables.OBJECTWORLD,
        ]);
        this.registerAttributeLocations(shaderProgram, ignore, [
            ShaderVariables.VERTEXPOSITION,
            ShaderVariables.VERTEXCOLOR,
        ]);
    }

    private registerUniformLocations(
        shaderProgram: ShaderProgram,
        ignore: boolean = false,
        names: ShaderVariables[]
    ): void {
        names.forEach((name: ShaderVariables, _i: int) =>
            this.registerUniformLocation(shaderProgram, name, ignore)
        );
    }

    private registerUniformLocation(
        shaderProgram: ShaderProgram,
        name: ShaderVariables,
        ignore: boolean = false
    ): void {
        const uniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(shaderProgram.program, name);
        if (!uniformLocation && ignore) {
            return;
        }
        if (!uniformLocation) {
            throw new Error(
                `ShaderManager: Fetching uniform location failed. (${name})`
            );
        }
        shaderProgram.uniformLocations.set(name, uniformLocation);
    }

    private registerInstanceUniformLocations(
        shaderProgram: ShaderProgram,
        ignore: boolean = false,
        names: ShaderVariables[]
    ): void {
        names.forEach((name: ShaderVariables, _i: int) =>
            this.registerInstanceUniformLocation(shaderProgram, name, ignore)
        );
    }

    private registerInstanceUniformLocation(
        shaderProgram: ShaderProgram,
        name: ShaderVariables,
        ignore: boolean = false
    ): void {
        const instanceUniformLocation: WebGLInstanceUniformLocation =
            this.gl.getAttribLocation(shaderProgram.program, name);
        if (instanceUniformLocation === -1 && ignore) {
            return;
        }
        if (instanceUniformLocation === -1) {
            throw new Error(
                `ShaderManager: Fetching instance uniform location failed. (${name})`
            );
        }
        shaderProgram.instanceUniformLocations.set(
            name,
            instanceUniformLocation
        );
    }

    private registerAttributeLocations(
        shaderProgram: ShaderProgram,
        ignore: boolean = false,
        names: ShaderVariables[]
    ): void {
        names.forEach((name: ShaderVariables, _i: int) =>
            this.registerAttributeLocation(shaderProgram, name, ignore)
        );
    }

    private registerAttributeLocation(
        shaderProgram: ShaderProgram,
        name: ShaderVariables,
        ignore: boolean = false
    ): void {
        const attributeLocation: WebGLAttributeLocation =
            this.gl.getAttribLocation(shaderProgram.program, name);
        if (attributeLocation === -1 && ignore) {
            return;
        }
        if (attributeLocation === -1) {
            throw new Error(
                `ShaderManager: Fetching attribute location failed. (${name})`
            );
        }
        shaderProgram.attributeLocations.set(name, attributeLocation);
    }
}
