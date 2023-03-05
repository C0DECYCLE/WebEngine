/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Renderer {
    private readonly clearColor: Vec3;

    private gl: WebGL2RenderingContext;
    private shaderManager: ShaderManager;
    private geometryManager: GeometryManager;
    private entityManager: EntityManager;
    private camera: Camera;
    private timer: RenderTimer;

    public constructor(clearColor: Vec3) {
        this.clearColor = clearColor;

        this.createContext(this.createCanvas());
        this.createShaderManager();
        this.createGeometryManager();
        this.createEntityManager();
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

        /*
        const geometry: Geometry = this.geometryManager.list.get("suzanne")!;

        cache.translate(0, 0, -1);
        cache.rotate(0, 0, 0);

        cache.translate(-2, 0, 0);
        cache.rotate(90 * toRadian, 90 * toRadian, 0);

        const geometry2: Geometry = this.geometryManager.list.get("torus")!;

        cache.translate(-1, 1, -1);
        cache.rotate(90 * toRadian, 180 * toRadian, 0);
        
        cache.translate(1, -1, 0);
        cache.rotate(0, 180 * toRadian, 0);
        */
    }

    public getCamera(): Camera {
        return this.camera;
    }

    public getEntityManager(): EntityManager {
        return this.entityManager;
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

    private createShaderManager(): void {
        this.shaderManager = new ShaderManager(this.gl);
    }

    private createGeometryManager(): void {
        this.geometryManager = new GeometryManager(this.gl, this.shaderManager);
    }

    private createEntityManager(): void {
        this.entityManager = new EntityManager(this.geometryManager);
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

    private updateFrame(): void {
        this.camera.update();
        this.entityManager.prepare();
    }

    private drawFrame(): void {
        this.clearViewport();

        const program: ShaderProgram = this.bindProgram("main");

        this.camera.bufferViewProjection(program);
        this.entityManager.draw();
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

    private bindProgram(name: string): ShaderProgram {
        const program: ShaderProgram = this.shaderManager.programs.get(name)!;
        this.gl.useProgram(program.program);
        return program;
    }
}
