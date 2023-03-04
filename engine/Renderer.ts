/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Renderer {
    public camera: Camera;

    private readonly clearColor: Vec3;

    private gl: WebGL2RenderingContext;
    private shaderManager: ShaderManager;
    private geometryManager: GeometryManager;
    private timer: RenderTimer;

    public constructor(clearColor: Vec3) {
        this.clearColor = clearColor;

        this.createContext(this.createCanvas());
        this.createShaderManager();
        this.createGeometryManager();
        this.createTimer();
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

        const cache: Mat4 = new Mat4(true);

        const geometry: Geometry = this.geometryManager.list.get("suzanne")!;

        cache.reset();
        cache.translate(0, 0, -1);
        cache.rotate(0, 0, 0);
        cache.scale(0.5, 0.5, 0.5);
        geometry.storeInstance(cache, 0);

        cache.reset();
        cache.translate(-2, 0, 0);
        cache.rotate(90 * toRadian, 90 * toRadian, 0);
        cache.scale(0.5, 0.5, 0.5);
        geometry.storeInstance(cache, 1);

        const geometry2: Geometry = this.geometryManager.list.get("torus")!;

        cache.reset();
        cache.translate(-1, 1, -1);
        cache.rotate(90 * toRadian, 180 * toRadian, 0);
        geometry2.storeInstance(cache, 0);

        cache.reset();
        cache.translate(1, -1, 0);
        cache.rotate(0, 180 * toRadian, 0);
        geometry2.storeInstance(cache, 1);

        //////////////////LOOP//////////////////

        this.camera.update();

        this.clearViewport();

        const program: ShaderProgram = this.shaderManager.programs.get("main")!;

        this.gl.useProgram(program.program);

        this.camera.bufferViewProjection(program);

        geometry.draw(2);
        geometry2.draw(2);
    }

    public render(now: float): void {
        this.timer.begin(now);

        this.timer.beginUpdate();
        this.updateFrame();
        this.timer.endUpdate();

        this.timer.beginDraw();
        this.drawFrame();
        this.timer.endDraw();

        this.timer.end(now);
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

    private createTimer(): void {
        this.timer = new RenderTimer();
    }

    private createCamera(): void {
        this.camera = new Camera(this.gl, 1000);
    }

    private initializeContext(): void {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    private updateFrame(): void {}

    private drawFrame(): void {}

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
