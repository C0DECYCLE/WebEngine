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

        //matrix
        const matrix: Mat3 = new Mat3(true);
        matrix.rotate(90 * toRadian);
        matrix.scale(1, 0.5);
        matrix.translate(0.5, 0);
        //vertecies
        const positions: Float32Array = new Float32Array([
            -0.5, -0.5, 0, 0.5, 0.5, -0.5,
        ]);

        //make shaders
        const program: WebGLProgram = this.shaderManager.programs.get("basic")!;

        //lookup uniform location
        const matrixUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(program, "object_matrix");
        const colorUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(program, "object_color");
        //lookup attribute location
        const positionAttributeLocation: int = this.gl.getAttribLocation(
            program,
            "vertex_position"
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
            2,
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

        //set current program
        this.gl.useProgram(program);
        //set vertex array object to use
        this.gl.bindVertexArray(vao);
        //set unifrom for object
        this.gl.uniform3f(
            colorUniformLocation,
            Math.random(),
            Math.random(),
            Math.random()
        );
        this.gl.uniformMatrix3fv(matrixUniformLocation, false, matrix.values);
        //draw call
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
}
