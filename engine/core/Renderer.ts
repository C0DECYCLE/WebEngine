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
    private light: Light;
    private stats: Stats;

    public constructor(clearColor?: Vec3, far?: float, antialiase?: boolean) {
        this.clearColor = clearColor;

        this.createContext(this.createCanvas(), antialiase);
        this.createStats();
        this.createShaderManager();
        this.createGeometryManager();
        this.createEntityManager();
        this.createCamera(far);
        this.createLight();
    }

    public async initialize(
        geometryUrls: string[] = [],
        shaderUrls: string[] = []
    ): Promise<void> {
        await this.shaderManager.initialize(shaderUrls);
        await this.geometryManager.initialize(geometryUrls);
        this.initializeContext();
    }

    public getEntityManager(): EntityManager {
        return this.entityManager;
    }

    public getCamera(): Camera {
        return this.camera;
    }

    public getLight(): Light {
        return this.light;
    }

    public render(now: float): void {
        this.stats.begin(now);

        this.stats.beginUpdate();
        this.update();
        this.stats.endUpdate();

        this.stats.beginDraw();
        this.draw();
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

    private createContext(
        canvas: HTMLCanvasElement,
        antialias: boolean = false
    ): void {
        const context: Nullable<WebGL2RenderingContext> = canvas.getContext(
            "webgl2",
            {
                alpha: true,
                antialias: antialias,
                depth: true,
                failIfMajorPerformanceCaveat: false,
                powerPreference: "high-performance",
                premultipliedAlpha: false,
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

    private createStats(): void {
        this.stats = new Stats();
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

    private createCamera(far?: float): void {
        this.camera = new Camera(this.gl, far);
    }

    private createLight(): void {
        this.light = new Light(this.gl, this.camera);
    }

    private initializeContext(): void {
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    private clearContext(): void {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        if (this.clearColor !== undefined) {
            this.gl.clearColor(
                this.clearColor.x,
                this.clearColor.y,
                this.clearColor.z,
                1.0
            );
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        }
    }

    private update(): void {
        this.camera.update();
        this.light.update();
        this.entityManager.prepare(); //prepare shadow seperate if enabled
    }

    private draw(): void {
        this.drawShadow();
        this.drawMain();
    }

    private drawShadow(): void {
        if (!this.light.shadow) {
            return;
        }
        this.light.shadow.beginFrameBuffer();

        const shadowProgram: ShaderProgram = this.bindProgram("shadow");

        this.light.shadow.bufferShadowUniforms(shadowProgram);

        this.entityManager.draw(false);

        this.light.shadow.endFrameBuffer();
    }

    private drawMain(): void {
        this.clearContext();

        const program: ShaderProgram = this.bindProgram("main");

        this.camera.bufferMainUniforms(program);
        this.light.bufferMainUniforms(program);

        this.entityManager.draw(true);
    }

    private bindProgram(name: string): ShaderProgram {
        const program: ShaderProgram = this.shaderManager.programs.get(name)!;
        this.gl.useProgram(program.program);
        return program;
    }
}
