/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Camera {
    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly target: Vec3 = new Vec3(0, 0, -1);
    public readonly up: Vec3 = new Vec3(0, 1, 0);

    private readonly origin: Vec3 = new Vec3(0, 0, 0);
    private readonly direction: Vec3 = new Vec3(0, 0, -1);
    private readonly world: Mat4 = new Mat4();
    private readonly projection: Mat4;
    private readonly cameraDirection: Float32Array = new Float32Array(3);
    private readonly viewProjection: Mat4 = new Mat4();

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext, far: float = 1_000) {
        this.gl = gl;
        const ratio: float = this.gl.canvas.width / this.gl.canvas.height;
        this.projection = Mat4.Perspective(60 * toRadian, ratio, 1, far);
    }

    public update(): void {
        this.computeMatrix();
    }

    public bufferUniforms(program: ShaderProgram): void {
        this.bufferCameraDirection(program);
        this.bufferViewProjection(program);
    }

    private computeMatrix(): void {
        this.direction.copy(this.target).sub(this.position).normalize();
        this.world.lookAt(this.origin, this.direction, this.up);
        this.cameraDirection[0] = this.direction.x;
        this.cameraDirection[1] = this.direction.y;
        this.cameraDirection[2] = this.direction.z;
        this.viewProjection
            .copy(this.world)
            .invert()
            .multiply(this.viewProjection, this.projection);
    }

    private bufferCameraDirection(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.CAMERADIRECTION
        )!;
        this.gl.uniform3fv(loc, this.cameraDirection);
    }

    private bufferViewProjection(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.VIEWPROJECTION
        )!;
        this.gl.uniformMatrix4fv(loc, false, this.viewProjection.values);
    }
}
