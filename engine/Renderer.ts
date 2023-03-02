/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Renderer {
    public camera: Camera;

    private readonly clearColor: Vec3;
    private then: float = -1;
    private deltaMs: float = 0;
    private updateMs: float = 0;
    private drawMs: float = 0;

    private gl: WebGL2RenderingContext;
    private shaderManager: ShaderManager;

    public get deltaTime(): float {
        return this.deltaMs;
    }

    public get updateTime(): float {
        return this.updateMs;
    }

    public get drawTime(): float {
        return this.drawMs;
    }

    public get fps(): float {
        return 1000 / this.deltaMs;
    }

    public constructor(clearColor: Vec3) {
        this.clearColor = clearColor;

        this.createContext(this.createCanvas());
        this.createShaderManager();
        this.createCamera();
    }

    public async initialize(
        geometryNames: string[] = [],
        shaderNames: string[] = []
    ): Promise<void> {
        //await this.geometryManager.initialize(geometryNames);
        await this.shaderManager.initialize(shaderNames);
        this.initializeContext();

        //////////////////SETUP//////////////////
        this.camera.position.set(100, 150, 250);
        this.camera.target.set(0, 0, 0);

        let objectWorld: Mat4 = new Mat4(); //object world transform matrix
        //objectWorld.translate(0, 125, -300);
        objectWorld.translate(-40, 0, -40);
        //objectWorld.rotate(135 * toRadian, 0 * toRadian, 22.5 * toRadian);
        objectWorld.rotate(90 * toRadian, 0, 0);
        //objectWorld.scale(1.5, 1.5, 1.5);

        let object2World: Mat4 = new Mat4();
        object2World.translate(-160, 0, 0);
        object2World.rotate(90 * toRadian, 0, 0);

        const program: WebGLProgram = this.shaderManager.programs.get("basic")!; //make shaders and shader programm

        const objectWorldUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(program, "objectWorld"); //lookup uniform location

        const viewProjectionUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(program, "viewProjection"); //lookup uniform location

        //const positionAttributeLocation: int = this.gl.getAttribLocation(
        //    program,
        //    "vertexPosition"
        //); //lookup attribute location

        const vao: Nullable<WebGLVertexArrayObject> =
            this.gl.createVertexArray(); //create vertex array object

        this.gl.bindVertexArray(vao); //enable putting stuff into vao

        this.gl.enableVertexAttribArray(0 /*positionAttributeLocation*/); //enable data attribute

        const positionBuffer: Nullable<WebGLBuffer> = this.gl.createBuffer(); //create gpu buffer

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer); //set transfer target

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            Fpositions,
            this.gl.STATIC_DRAW
        ); //transfer cpu to gpu buffer

        this.gl.vertexAttribPointer(
            0 /*positionAttributeLocation*/,
            3, //stride
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

        this.camera.update(); //compute the current viewProjection
        this.gl.uniformMatrix4fv(
            viewProjectionUniformLocation,
            false,
            this.camera.viewProjection.values
        ); //set unifrom for object

        this.gl.uniformMatrix4fv(
            objectWorldUniformLocation,
            false,
            objectWorld.values
        ); //set unifrom for object matrix

        this.gl.drawArrays(this.gl.TRIANGLES, 0, Fpositions.length / 3); //draw call

        this.gl.uniformMatrix4fv(
            objectWorldUniformLocation,
            false,
            object2World.values
        ); //set unifrom for object matrix

        this.gl.drawArrays(this.gl.TRIANGLES, 0, Fpositions.length / 3); //draw call
    }

    public render(now: float): void {
        if (this.then === -1) {
            this.then = now;
        }

        const preUpdateMs: float = performance.now();

        this.updateFrame();
        this.updateMs = performance.now() - preUpdateMs;

        const preDrawMs: float = performance.now();

        this.drawFrame();
        this.drawMs = performance.now() - preDrawMs;

        this.deltaMs = now - this.then;
        this.then = now;
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

    private updateFrame(): void {
        //for each renderlist
    }

    private drawFrame(): void {
        //this.clearContext();
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
