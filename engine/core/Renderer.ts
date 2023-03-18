/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Renderer {
    private readonly clearColor?: Vec3;

    private gl: WebGL2RenderingContext;
    private shaderManager: ShaderManager;
    private geometryManager: GeometryManager;
    private entityManager: EntityManager;
    private camera: Camera;
    private stats: Stats;

    public constructor(clearColor?: Vec3, far?: float) {
        this.clearColor = clearColor;

        this.createContext(this.createCanvas());
        this.createStats();
        this.createShaderManager();
        this.createGeometryManager();
        this.createEntityManager();
        this.createCamera(far);
    }

    public async initialize(
        geometryUrls: string[] = [],
        shaderUrls: string[] = []
    ): Promise<void> {
        await this.shaderManager.initialize(shaderUrls);
        await this.geometryManager.initialize(geometryUrls);
        this.initializeContext();
    }

    public getCamera(): Camera {
        return this.camera;
    }

    public getEntityManager(): EntityManager {
        return this.entityManager;
    }

    public render(now: float): void {
        this.stats.begin(now);

        this.stats.beginUpdate();
        this.updateFrame();
        this.stats.endUpdate();

        this.stats.beginDraw();
        this.drawFrame();
        this.stats.endDraw();

        this.stats.end(now);
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
        const context: Nullable<WebGL2RenderingContext> = canvas.getContext(
            "webgl2",
            {
                alpha: false,
                antialias: false,
                depth: true,
                failIfMajorPerformanceCaveat: false,
                powerPreference: "high-performance",
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                stencil: false,
                desynchronized: false,
            } as WebGLContextAttributes
        );
        if (!context) {
            throw new Error("Renderer: Get WebGL2RenderingContext failed.");
        }
        this.gl = context;
    }

    private createShaderManager(): void {
        this.shaderManager = new ShaderManager(this.gl);
    }

    private createGeometryManager(): void {
        this.geometryManager = new GeometryManager(
            this.gl,
            this.shaderManager,
            this.stats
        );
    }

    private createEntityManager(): void {
        this.entityManager = new EntityManager(
            this.geometryManager,
            this.stats
        );
    }

    private createStats(): void {
        this.stats = new Stats();
    }

    private createCamera(far?: float): void {
        this.camera = new Camera(this.gl, far);
    }

    private initializeContext(): void {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        if (this.clearColor !== undefined) {
            this.gl.clearColor(
                this.clearColor.x,
                this.clearColor.y,
                this.clearColor.z,
                1.0
            );
        }
    }

    private updateFrame(): void {
        this.camera.update();
        this.entityManager.prepare();
    }

    private drawFrame(): void {
        if (this.clearColor !== undefined) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        }

        const program: ShaderProgram = this.bindProgram("main");

        this.camera.bufferViewProjection(program);
        this.entityManager.draw();
    }

    private bindProgram(name: string): ShaderProgram {
        const program: ShaderProgram = this.shaderManager.programs.get(name)!;
        this.gl.useProgram(program.program);
        return program;
    }
}
