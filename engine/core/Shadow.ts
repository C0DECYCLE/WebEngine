/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Shadow {
    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly direction: Vec3 = new Vec3(0, -1, 0);
    public radius: float = 10;
    public bias: int = 0.0;
    public opcaity: int = 1.0;

    private readonly size: int;

    private readonly origin: Vec3 = new Vec3(0, 0, 0);
    private readonly target: Vec3 = new Vec3(0, -1, 0);
    private readonly up: Vec3 = new Vec3(0, 1, 0);

    private readonly world: Mat4 = new Mat4();
    private readonly projection: Mat4 = new Mat4();
    private readonly viewProjection: Mat4 = new Mat4();
    private readonly shadowProjection: Mat4 = new Mat4();

    private depthTexture: WebGLTexture;
    private depthFrameBuffer: WebGLFramebuffer;
    private projectionBase: Mat4;

    private readonly gl: WebGL2RenderingContext;

    private readonly camera: Camera;

    public constructor(gl: WebGL2RenderingContext, camera: Camera, size: int) {
        this.gl = gl;
        this.camera = camera;
        this.size = size;
        this.createDepthTexture(this.size);
        this.createDepthFrameBuffer();
        this.createProjectionBase();
    }

    /**
     * @internal
     */
    public update(): void {
        this.computeVectors();
        this.computeMatricies();
    }

    /**
     * @internal
     */
    public beginFrameBuffer(): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthFrameBuffer);
        this.gl.viewport(0, 0, this.size, this.size);
        this.gl.cullFace(this.gl.FRONT);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    /**
     * @internal
     */
    public endFrameBuffer(): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    /**
     * @internal
     */
    public bufferShadowUniforms(program: ShaderProgram): void {
        this.bufferViewProjectionUniform(program);
    }

    /**
     * @internal
     */
    public bufferMainUniforms(program: ShaderProgram): void {
        this.bufferWorldUniform(program);
        this.bufferMapUniform(program);
        this.bufferBiasUniform(program);
        this.bufferOpacityUniform(program);
        this.bufferMapSizeUniform(program);
    }

    private createDepthTexture(size: int): void {
        const depthTexture: Nullable<WebGLTexture> = this.gl.createTexture();
        if (!depthTexture) {
            throw new Error("Shadow: Creating depth texture failed.");
        }
        this.depthTexture = depthTexture;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
        this.textureImage(
            size,
            this.gl.DEPTH_COMPONENT32F,
            this.gl.DEPTH_COMPONENT,
            this.gl.FLOAT
        );
        this.textureParameter(this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.textureParameter(this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.textureParameter(this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.textureParameter(this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    private textureImage(
        size: int,
        intern: GLenum,
        format: GLenum,
        type: GLenum
    ): void {
        const tar: GLenum = this.gl.TEXTURE_2D;
        this.gl.texImage2D(tar, 0, intern, size, size, 0, format, type, null);
    }

    private textureParameter(name: GLenum, param: GLenum): void {
        this.gl.texParameteri(this.gl.TEXTURE_2D, name, param);
    }

    private createDepthFrameBuffer(): void {
        const depthFrameBuffer: Nullable<WebGLFramebuffer> =
            this.gl.createFramebuffer();
        if (!depthFrameBuffer) {
            throw new Error("Shadow: Creating depth frame buffer failed.");
        }
        this.depthFrameBuffer = depthFrameBuffer;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthFrameBuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.DEPTH_ATTACHMENT,
            this.gl.TEXTURE_2D,
            this.depthTexture,
            0
        );
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    private createProjectionBase(): void {
        this.projectionBase = new Mat4();
        this.projectionBase.translate(0.5, 0.5, 0.5);
        this.projectionBase.scale(0.5, 0.5, 0.5);
    }

    private computeVectors(): void {
        this.origin
            .copy(this.direction)
            .scale(-this.radius)
            .add(this.position)
            .sub(this.camera.position);
        this.target.copy(this.origin).add(this.direction);
    }

    private computeMatricies(): void {
        this.world.lookAt(this.origin, this.target, this.up);
        this.projection.orthographic(
            -this.radius,
            this.radius,
            this.radius,
            -this.radius,
            0,
            this.radius * 2
        );
        this.viewProjection
            .copy(this.world)
            .invert()
            .multiply(this.viewProjection, this.projection);
        this.shadowProjection
            .copy(this.projectionBase)
            .multiply(this.viewProjection);
    }

    private bufferViewProjectionUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.VIEWPROJECTION
        )!;
        this.gl.uniformMatrix4fv(loc, false, this.viewProjection.values);
    }

    private bufferWorldUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.SHADOWPROJECTION
        )!;
        this.gl.uniformMatrix4fv(loc, false, this.shadowProjection.values);
    }

    private bufferMapUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.SHADOWMAP
        )!;
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
        this.gl.uniform1i(loc, 0);
    }

    private bufferBiasUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.SHADOWBIAS
        )!;
        this.gl.uniform1f(loc, this.bias);
    }

    private bufferOpacityUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.SHADOWOPACITY
        )!;
        this.gl.uniform1f(loc, this.opcaity);
    }

    private bufferMapSizeUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.SHADOWMAPSIZE
        )!;
        this.gl.uniform1f(loc, this.size);
    }
}
