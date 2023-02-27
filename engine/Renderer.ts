/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Renderer {
    public camera: Camera;

    private gl: WebGL2RenderingContext;

    private shaderManager: ShaderManager;

    private clearColor: Vec3;

    public constructor(clearColor: Vec3) {
        this.createContext(this.createCanvas());
        this.createShaderManager();
        this.createCamera();

        this.clearColor = clearColor;
    }

    public async initialize(): Promise<void> {
        await this.shaderManager.initialize();
        this.initializeContext();

        //////////////////SETUP//////////////////

        //matrix
        const matrix: Mat4 = this.camera.projection.clone();
        matrix.translate(0, 125, -300);
        matrix.rotate(135 * toRadian, 0 * toRadian, 22.5 * toRadian);
        matrix.scale(1.5, 1.5, 1.5);
        //vertecies
        const stride: int = 3;
        const positions: Float32Array = new Float32Array([
            0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0, 30,
            0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0, 30,
            60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0, 0, 0,
            30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30, 30,
            0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,
            30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90,
            30, 0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,
            100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0,
            30, 30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100,
            30, 0, 30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30,
            60, 30, 30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67,
            60, 30, 67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67,
            90, 30, 30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30,
            67, 90, 0, 30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150,
            0, 30, 150, 30, 0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30,
            150, 30, 30, 150, 0, 0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150,
            30, 0, 150, 0,
        ]);

        //make shaders
        const program: WebGLProgram = this.shaderManager.programs.get("basic")!;

        //lookup uniform location
        const matrixUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(program, "objectMatrix");
        //lookup attribute location
        const positionAttributeLocation: int = this.gl.getAttribLocation(
            program,
            "vertexPosition"
        );

        //create vertex array object
        const vao: Nullable<WebGLVertexArrayObject> =
            this.gl.createVertexArray();
        //enable putting stuff into vao
        this.gl.bindVertexArray(vao);
        //tell how to map the vertecies and the program
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        //put vertecies into gpu buffer
        const positionBuffer: Nullable<WebGLBuffer> = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            positions,
            this.gl.STATIC_DRAW
        );
        this.gl.vertexAttribPointer(
            positionAttributeLocation,
            stride,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        //finish with setting up this vao
        this.gl.bindVertexArray(null);

        //////////////////LOOP//////////////////

        this.clearContext();

        //set current program
        this.gl.useProgram(program);
        //set vertex array object to use
        this.gl.bindVertexArray(vao);
        //set unifrom for object
        this.gl.uniformMatrix4fv(matrixUniformLocation, false, matrix.values);
        //draw call
        this.gl.drawArrays(this.gl.TRIANGLES, 0, positions.length / stride);
    }

    private createCanvas(): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = document.body.clientWidth * devicePixelRatio;
        canvas.height = document.body.clientHeight * devicePixelRatio;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        document.body.appendChild(canvas);
        return canvas;
    }

    private createContext(canvas: HTMLCanvasElement): void {
        const context: Nullable<WebGL2RenderingContext> =
            canvas.getContext("webgl2");

        if (!context) {
            console.error("Renderer: Get WebGL2RenderingContext failed.");
            return;
        }
        this.gl = context;
    }

    private createShaderManager(): void {
        this.shaderManager = new ShaderManager(this.gl);
    }

    private createCamera(): void {
        this.camera = new Camera(this.gl, 1000);
    }

    private initializeContext(): void {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    private clearContext(): void {
        this.gl.clearColor(
            this.clearColor.x,
            this.clearColor.y,
            this.clearColor.z,
            1.0
        );
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}
