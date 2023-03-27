/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Camera {
    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly target: Vec3 = new Vec3(0, 0, -1);
    public readonly up: Vec3 = new Vec3(0, 1, 0);

    private readonly right: Vec3 = new Vec3(1, 0, 0);

    private readonly fov: float;
    private readonly ratio: float;
    private readonly near: float;
    private readonly far: float;

    private readonly origin: Vec3 = new Vec3(0, 0, 0);
    private readonly direction: Vec3 = new Vec3(0, 0, -1);

    private readonly world: Mat4 = new Mat4();
    private readonly projection: Mat4 = new Mat4();
    private readonly cameraDirection: Float32Array = new Float32Array(3);
    private readonly viewProjection: Mat4 = new Mat4();

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext, far: float = 10_000) {
        this.gl = gl;
        this.fov = 60 * toRadian;
        this.ratio = this.gl.canvas.width / this.gl.canvas.height;
        this.near = 1;
        this.far = far;
        this.projection.perspective(this.fov, this.ratio, this.near, this.far);
    }

    public inView(
        directionX: float,
        directionY: float,
        directionZ: float,
        minimum: float
    ): boolean {
        return this.direction.dot(directionX, directionY, directionZ) > minimum;
    }

    public eUpdate(): void {
        this.computeVectors();
        this.computeMatricies();
    }

    public eBufferMainUniforms(program: ShaderProgram): void {
        this.bufferCameraDirectionUniform(program);
        this.bufferViewProjectionUniform(program);
    }

    private computeVectors(): void {
        this.direction.copy(this.target).sub(this.position).normalize();
        this.up.normalize();
        this.right.copy(this.direction).cross(this.up);

        this.cameraDirection[0] = this.direction.x;
        this.cameraDirection[1] = this.direction.y;
        this.cameraDirection[2] = this.direction.z;
    }

    private computeMatricies(): void {
        this.world.lookAt(this.origin, this.direction, this.up);
        this.viewProjection
            .copy(this.world)
            .invert()
            .multiply(this.viewProjection, this.projection);
    }

    private bufferCameraDirectionUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.CAMERADIRECTION
        )!;
        this.gl.uniform3fv(loc, this.cameraDirection);
    }

    private bufferViewProjectionUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.VIEWPROJECTION
        )!;
        this.gl.uniformMatrix4fv(loc, false, this.viewProjection.values);
    }
}
