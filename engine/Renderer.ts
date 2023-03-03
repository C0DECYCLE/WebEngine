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
    private geometryManager: GeometryManager;

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
        this.createGeometryManager();
        this.createCamera();
    }

    public async initialize(
        geometryNames: string[] = [],
        shaderNames: string[] = []
    ): Promise<void> {
        await this.shaderManager.initialize(shaderNames);
        await this.geometryManager.initialize(geometryNames);
        this.initializeContext();

        //////////////////SETUP//////////////////

        this.camera.position.set(1, 1.5, 2);
        this.camera.target.set(0, 0, 0);

        const geometry: Geometry = this.geometryManager.list.get("torus")!;

        const objectWorld: Mat4 = new Mat4(true);
        objectWorld.translate(0, 0, -1);
        objectWorld.rotate(90 * toRadian, 0, 0);

        const objectWorld2: Mat4 = new Mat4(true);
        objectWorld2.translate(-2, 0, 0);
        objectWorld2.rotate(180 * toRadian, 0, 0);

        objectWorld.store(geometry.instanceWorlds, 0 * 16);
        objectWorld2.store(geometry.instanceWorlds, 1 * 16);

        const geometry2: Geometry = this.geometryManager.list.get("icosphere")!;

        const objectWorld3: Mat4 = new Mat4(true);
        objectWorld3.translate(-1, 1, -1);
        objectWorld3.rotate(180 * toRadian, 0, 0);

        const objectWorld4: Mat4 = new Mat4(true);
        objectWorld4.translate(1, -1, 0);
        objectWorld4.rotate(0, 0, 90 * toRadian);

        objectWorld3.store(geometry2.instanceWorlds, 0 * 16);
        objectWorld4.store(geometry2.instanceWorlds, 1 * 16);

        //////////////////LOOP//////////////////

        this.camera.update();

        this.clearViewport();

        const program: ShaderProgram = this.shaderManager.programs.get("main")!;

        this.gl.useProgram(program.program);

        this.gl.uniformMatrix4fv(
            program.uniformLocations.get("viewProjection")!,
            false,
            this.camera.viewProjection.values
        );

        geometry.draw(2);
        geometry2.draw(2);
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
            throw new Error("Renderer: Get WebGL2RenderingContext failed.");
        }
        this.gl = context;
    }

    private createGeometryManager(): void {
        this.geometryManager = new GeometryManager(this.gl, this.shaderManager);
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
