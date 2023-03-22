/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Light {
    public readonly ambient: Vec3 = new Vec3(0, 0, 0);
    public readonly direction: Vec3 = new Vec3(0, -1, 0);
    public readonly color: Vec3 = new Vec3(1, 1, 1);

    private readonly ambientColor: Float32Array = new Float32Array(3);
    private readonly lightDirection: Float32Array = new Float32Array(3);
    private readonly lightColor: Float32Array = new Float32Array(3);

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public update(): void {
        this.compute();
    }

    public bufferUniforms(program: ShaderProgram): void {
        this.bufferAmbientColor(program);
        this.bufferLightDirection(program);
        this.bufferLightColor(program);
    }

    private compute(): void {
        this.ambientColor[0] = this.ambient.x;
        this.ambientColor[1] = this.ambient.y;
        this.ambientColor[2] = this.ambient.z;

        this.lightDirection[0] = this.direction.x;
        this.lightDirection[1] = this.direction.y;
        this.lightDirection[2] = this.direction.z;

        this.lightColor[0] = this.color.x;
        this.lightColor[1] = this.color.y;
        this.lightColor[2] = this.color.z;
    }

    private bufferAmbientColor(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.AMBIENTCOLOR
        )!;
        this.gl.uniform3fv(loc, this.ambientColor);
    }

    private bufferLightDirection(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.LIGHTDIRECTION
        )!;
        this.gl.uniform3fv(loc, this.lightDirection);
    }

    private bufferLightColor(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.LIGHTCOLOR
        )!;
        this.gl.uniform3fv(loc, this.lightColor);
    }
}
