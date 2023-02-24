/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Renderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;

    private shaderManager: ShaderManager;

    public constructor() {
        this.createCanvas();
        this.createContext();
        this.createShaderManager();
    }

    public async initialize(clearColor: Vec3): Promise<void> {
        this.initializeContext(clearColor);
        await this.shaderManager.initialize();

        const program: WebGLProgram = this.shaderManager.programs.get("basic")!;

        const colorUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(program, "object_color");

        const positionAttributeLocation: int = this.gl.getAttribLocation(
            program,
            "vertex_position"
        );

        const positionBuffer: Nullable<WebGLBuffer> = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

        const positions: Float32Array = new Float32Array([
            -0.5, -0.5, 0, 0.5, 0.5, -0.5,
        ]);

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            positions,
            this.gl.STATIC_DRAW
        );

        const vao: Nullable<WebGLVertexArrayObject> =
            this.gl.createVertexArray();

        this.gl.bindVertexArray(vao);

        this.gl.enableVertexAttribArray(positionAttributeLocation);

        this.gl.vertexAttribPointer(
            positionAttributeLocation,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.useProgram(program);

        this.gl.bindVertexArray(vao);

        this.gl.uniform3f(
            colorUniformLocation,
            Math.random(),
            Math.random(),
            Math.random()
        );

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    private createCanvas(): void {
        this.canvas = document.createElement("canvas");
        this.canvas.width = document.body.clientWidth * devicePixelRatio;
        this.canvas.height = document.body.clientHeight * devicePixelRatio;
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        document.body.appendChild(this.canvas);
    }

    private createContext(): void {
        const context: Nullable<WebGL2RenderingContext> =
            this.canvas.getContext("webgl2");

        if (!context) {
            console.error("Renderer: Get WebGL2RenderingContext failed.");
            return;
        }
        this.gl = context;
    }

    private createShaderManager(): void {
        this.shaderManager = new ShaderManager(this.gl);
    }

    private initializeContext(clearColor: Vec3): void {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(clearColor.x, clearColor.y, clearColor.z, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}
