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

        const matrix: Mat4 = this.camera.projection.clone(); //object world transform matrix
        matrix.translate(0, 125, -300);
        matrix.rotate(135 * toRadian, 0 * toRadian, 22.5 * toRadian);
        matrix.scale(1.5, 1.5, 1.5);

        const stride: int = 3; //attribute stride
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
        ]); //vertecies cpu buffer

        const program: WebGLProgram = this.shaderManager.programs.get("basic")!; //make shaders and shader programm

        const matrixUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(program, "objectMatrix"); //lookup uniform location

        const positionAttributeLocation: int = this.gl.getAttribLocation(
            program,
            "vertexPosition"
        ); //lookup attribute location

        const vao: Nullable<WebGLVertexArrayObject> =
            this.gl.createVertexArray(); //create vertex array object

        this.gl.bindVertexArray(vao); //enable putting stuff into vao

        this.gl.enableVertexAttribArray(positionAttributeLocation); //enable data attribute

        const positionBuffer: Nullable<WebGLBuffer> = this.gl.createBuffer(); //create gpu buffer

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer); //set transfer target

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            positions,
            this.gl.STATIC_DRAW
        ); //transfer cpu to gpu buffer

        this.gl.vertexAttribPointer(
            positionAttributeLocation,
            stride,
            this.gl.FLOAT,
            false,
            0,
            0
        ); //tell how to pull data out of buffer

        this.gl.bindVertexArray(null); //finish with setting up this vao

        //////////////////LOOP//////////////////

        this.clearContext();

        this.gl.useProgram(program); //set current program

        this.gl.bindVertexArray(vao); //set vertex array object to use

        this.gl.uniformMatrix4fv(matrixUniformLocation, false, matrix.values); //set unifrom for object

        this.gl.drawArrays(this.gl.TRIANGLES, 0, positions.length / stride); //draw call
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
