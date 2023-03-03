/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class ShaderManager {
    public readonly rootPath: string = "/engine/shaders/";
    public readonly names: string[] = ["basic"];

    public readonly sources: MapS<ShaderSourcePair> =
        new MapS<ShaderSourcePair>();
    public readonly pairs: MapS<ShaderPair> = new MapS<ShaderPair>();
    public readonly programs: MapS<ShaderProgram> = new MapS<ShaderProgram>();

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public async initialize(names: string[]): Promise<void> {
        this.names.push(...names);
        await this.fetchShaderSources();
        this.createShaders();
        this.createPrograms();
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
            console.error("Renderer: Shader creation failed.");
            return null;
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
        console.error(
            `Renderer: Shader compilation failed. (${shaderInfoLog})`
        );
        return null;
    }

    private createProgram(
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader
    ): Nullable<WebGLProgram> {
        const program: Nullable<WebGLProgram> = this.gl.createProgram();
        if (!program) {
            console.error("Renderer: Program creation failed.");
            return null;
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
        console.error(`Renderer: Program creation failed. (${programInfoLog})`);
        return null;
    }

    private async fetchShaderSources(): Promise<void> {
        await Promise.all(
            this.shaderSourceUrls().map((sourceUrl: string) =>
                this.fetchShaderSourceUrls(sourceUrl)
            )
        );
    }

    private shaderSourceUrls(): string[] {
        const shaderSourceUrls: string[] = [];
        this.names.forEach((name) =>
            shaderSourceUrls.push(
                `${this.rootPath}${name}.${ShaderTypes.VERTEX}.fx`,
                `${this.rootPath}${name}.${ShaderTypes.FRAGMENT}.fx`
            )
        );
        return shaderSourceUrls;
    }

    private fetchShaderSourceUrls(sourceUrl: string): Promise<void | Response> {
        return fetch(sourceUrl).then(async (response: Response) => {
            const shaderSourceInfo: Nullable<ShaderSourceInfo> =
                this.getShaderSourceInfo(sourceUrl);

            if (!shaderSourceInfo) {
                console.error("Renderer: Fetching ShaderInfo failed.");
                return;
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
        sourcePair[shaderSourceInfo.type] = source;
        this.sources.set(shaderSourceInfo.name, sourcePair);
    }

    private createShaders(): void {
        this.sources.forEach((sourcePair: ShaderSourcePair, name: string) =>
            this.pairs.set(name, {
                [ShaderTypes.VERTEX]: this.createShader(
                    ShaderTypes.VERTEX,
                    sourcePair[ShaderTypes.VERTEX]
                )!,
                [ShaderTypes.FRAGMENT]: this.createShader(
                    ShaderTypes.FRAGMENT,
                    sourcePair[ShaderTypes.FRAGMENT]
                )!,
            } as ShaderPair)
        );
    }

    private createPrograms(): void {
        this.pairs.forEach((pair: ShaderPair, name: string) =>
            this.programs.set(name, this.createShaderProgram(pair))
        );
    }

    private createShaderProgram(pair: ShaderPair): ShaderProgram {
        const result: ShaderProgram = {} as ShaderProgram;
        result.program = this.createProgram(
            pair[ShaderTypes.VERTEX],
            pair[ShaderTypes.FRAGMENT]
        )!;
        result.uniformLocations = new MapS<WebGLUniformLocation>();
        result.instanceUniformLocations =
            new MapS<WebGLInstanceUniformLocation>();
        result.attributeLocations = new MapS<WebGLAttributeLocation>();
        this.registerLocations(result);
        return result;
    }

    private registerLocations(shaderProgram: ShaderProgram): void {
        this.registerUniformLocation(shaderProgram, "viewProjection");
        this.registerInstanceUniformLocation(shaderProgram, "objectWorld");
        this.registerAttributeLocation(shaderProgram, "vertexPosition");
    }

    private registerUniformLocation(
        shaderProgram: ShaderProgram,
        name: string
    ): void {
        const uniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(shaderProgram.program, name);
        if (!uniformLocation) {
            console.error("Renderer: Fetching uniform location failed.");
            return;
        }
        shaderProgram.uniformLocations.set(name, uniformLocation);
    }

    private registerInstanceUniformLocation(
        shaderProgram: ShaderProgram,
        name: string
    ): void {
        shaderProgram.instanceUniformLocations.set(
            name,
            this.gl.getAttribLocation(shaderProgram.program, name)
        );
    }

    private registerAttributeLocation(
        shaderProgram: ShaderProgram,
        name: string
    ): void {
        shaderProgram.attributeLocations.set(
            name,
            this.gl.getAttribLocation(shaderProgram.program, name)
        );
    }
}
