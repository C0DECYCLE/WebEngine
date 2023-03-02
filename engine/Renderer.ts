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

        this.camera.position.set(1, 1.5, 2);
        this.camera.target.set(0, 0, 0);

        const objectNumInstances: int = 3;
        const objectWorldInstances: Float32Array = new Float32Array(
            objectNumInstances * 16 //Mat4 = 16 floats
        );

        const objectWorld: Mat4 = new Mat4();
        objectWorld.translate(0, 0, -1);
        objectWorld.rotate(90 * toRadian, 0, 0);

        const objectWorld2: Mat4 = new Mat4();
        objectWorld2.translate(-2, 0, 0);
        objectWorld2.rotate(180 * toRadian, 0, 0);

        const objectWorld3: Mat4 = new Mat4();
        objectWorld3.translate(-1, 1, -1);
        objectWorld3.rotate(180 * toRadian, 0, 0);

        objectWorld.store(objectWorldInstances, 0 * 16);
        objectWorld2.store(objectWorldInstances, 1 * 16);
        objectWorld3.store(objectWorldInstances, 2 * 16);

        const basicProgram: WebGLProgram =
            this.shaderManager.programs.get("basic")!;

        const viewProjectionUniformLocation: Nullable<WebGLUniformLocation> =
            this.gl.getUniformLocation(basicProgram, "viewProjection");
        const objectWorldInstanceUniformLocation: int =
            this.gl.getAttribLocation(basicProgram, "objectWorld");
        const vertexPositionAttributeLocation: int = this.gl.getAttribLocation(
            basicProgram,
            "vertexPosition"
        );

        const objectVAO: Nullable<WebGLVertexArrayObject> =
            this.gl.createVertexArray();
        this.gl.bindVertexArray(objectVAO);

        const objectWorldInstancesBuffer: Nullable<WebGLBuffer> =
            this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, objectWorldInstancesBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            objectWorldInstances.byteLength, //2 * 16 * 4
            this.gl.DYNAMIC_DRAW
        );
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, objectWorldInstances);

        //Mat4 needs 4 vertex attributes (max 4 floats per attribute)
        for (let i = 0; i < 4; ++i) {
            this.gl.enableVertexAttribArray(
                objectWorldInstanceUniformLocation + i
            );
            this.gl.vertexAttribPointer(
                objectWorldInstanceUniformLocation + i,
                4,
                this.gl.FLOAT,
                false,
                16 * 4, // bytes per instance matrix stride
                i * 4 * 4 // offset in buffer, 4 floats per row, 4 bytes per float
            );
            this.gl.vertexAttribDivisor(
                objectWorldInstanceUniformLocation + i,
                1
            ); // only change once per instance
        }

        const vertexPositionsBuffer: Nullable<WebGLBuffer> =
            this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexPositionsBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            Fpositions,
            this.gl.STATIC_DRAW
        );

        this.gl.enableVertexAttribArray(vertexPositionAttributeLocation);
        this.gl.vertexAttribPointer(
            vertexPositionAttributeLocation,
            3, //stride
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.bindVertexArray(null);

        //////////////////LOOP//////////////////

        this.camera.update();

        this.clearViewport();

        this.gl.useProgram(basicProgram);

        this.gl.bindVertexArray(objectVAO);

        this.gl.uniformMatrix4fv(
            viewProjectionUniformLocation,
            false,
            this.camera.viewProjection.values
        );

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, objectWorldInstancesBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, objectWorldInstances);

        this.gl.drawArraysInstanced(
            this.gl.TRIANGLES,
            0,
            Fpositions.length / 3, // num vertices per instance
            objectNumInstances // num instances
        );
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
        //this.clearViewport();
    }

    private clearViewport(): void {
        this.gl.clearColor(
            this.clearColor.x,
            this.clearColor.y,
            this.clearColor.z,
            1.0
        );
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}
