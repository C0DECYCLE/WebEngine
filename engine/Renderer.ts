/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Renderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;

    private shaderManager: ShaderManager;

    private clearColor: Vec3;

    public constructor() {
        this.createCanvas();
        this.createContext();
        this.createShaderManager();
    }

    public async initialize(clearColor: Vec3): Promise<void> {
        this.clearColor = clearColor;
        await this.shaderManager.initialize();

        //projection
        const projectionMatrix: Mat4 = Mat4.perspective(
            60 * toRadian,
            this.canvas.width / this.canvas.height,
            1,
            1000
        );
        //matrix
        const matrix: Mat4 = projectionMatrix.clone();
        matrix.translate(0, 75, -300);
        matrix.rotate(135 * toRadian, 0 * toRadian, 22.5 * toRadian);
        //matrix.scale(2, 2, 2);
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

        //set render dimensions
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        //set background color and clear
        this.gl.clearColor(
            this.clearColor.x,
            this.clearColor.y,
            this.clearColor.z,
            1.0
        );
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        //enable backface culling
        this.gl.enable(this.gl.CULL_FACE);
        //enable depth buffer
        this.gl.enable(this.gl.DEPTH_TEST);

        //set current program
        this.gl.useProgram(program);
        //set vertex array object to use
        this.gl.bindVertexArray(vao);
        //set unifrom for object
        this.gl.uniformMatrix4fv(matrixUniformLocation, false, matrix.values);
        //draw call
        this.gl.drawArrays(this.gl.TRIANGLES, 0, positions.length / stride);
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
}
