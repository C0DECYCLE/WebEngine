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
        shaderUrls: string[] = [],
        lodMatrix: GeometryLodConfig[] = Geometry.LodMatrix
    ): Promise<void> {
        await this.shaderManager._initialize(shaderUrls);
        await this.geometryManager._initialize(geometryUrls, lodMatrix);
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
        this.stats._begin(now);
        this.stats._beginUpdate();
        this.update();
        this.stats._endUpdate();
        this.stats._beginDraw();
        this.draw();
        this.stats._endDraw();
        this.stats._end(now);
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
        }
        this.gl.cullFace(this.gl.BACK);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    private update(): void {
        const shadow = this.light.getShadow();
        this.camera._update();
        this.light._update();
        this.entityManager._prepare();
        if (shadow) {
            this.entityManager._shadowify(shadow);
        }
    }

    private draw(): void {
        this.drawShadow();
        this.stats._beginSubUpdate();
        this.entityManager._store();
        this.stats._endSubUpdate();
        this.drawMain();
    }

    private drawShadow(): void {
        const shadow = this.light.getShadow();
        if (!shadow) {
            return;
        }
        shadow._beginFrameBuffer();

        const shadowProgram: ShaderProgram = this.bindProgram("shadow");

        shadow._bufferShadowUniforms(shadowProgram);

        this.entityManager._draw(true);

        shadow._endFrameBuffer();
    }

    private drawMain(): void {
        this.clearContext();

        const program: ShaderProgram = this.bindProgram("main");

        this.camera._bufferMainUniforms(program);
        this.light._bufferMainUniforms(program);

        this.entityManager._draw(false);
    }

    private bindProgram(name: string): ShaderProgram {
        const program: ShaderProgram = this.shaderManager.programs.get(name)!;
        this.gl.useProgram(program.program);
        return program;
    }
}
