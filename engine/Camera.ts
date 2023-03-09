/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Camera {
    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly target: Vec3 = new Vec3(0, 0, -1);
    public readonly up: Vec3 = new Vec3(0, 1, 0);

    private readonly world: Mat4 = new Mat4(true);
    private readonly projection: Mat4;
    private readonly viewProjection: Mat4 = new Mat4(true);

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext, far: float) {
        this.gl = gl;
        const ratio: float = this.gl.canvas.width / this.gl.canvas.height;
        this.projection = Mat4.Perspective(60 * toRadian, ratio, 1, far, true);
        this.computeMatrix();
    }

    public update(): void {
        this.computeMatrix();
    }

    public bufferViewProjection(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.VIEWPROJECTION
        )!;
        this.gl.uniformMatrix4fv(loc, false, this.viewProjection.values);
    }

    private computeMatrix(): void {
        //floating origin
        this.world.lookAt(this.position, this.target, this.up);
        this.viewProjection
            .copy(this.world)
            .invert()
            .multiply(this.viewProjection, this.projection);
    }
}
