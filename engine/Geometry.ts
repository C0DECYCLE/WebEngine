/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Geometry {
    public readonly data: GeometryData;
    public readonly program: ShaderProgram;

    private instanceWorlds: Float32Array;

    private readonly gl: WebGL2RenderingContext;
    private vertexArrayObject: WebGLVertexArrayObject;
    private instanceWorldsBuffer: WebGLBuffer;
    private verteciesBuffer: WebGLBuffer;
    private colorsBuffer: WebGLBuffer;

    public constructor(
        gl: WebGL2RenderingContext,
        data: GeometryData,
        program: ShaderProgram
    ) {
        this.gl = gl;
        this.data = data;
        this.program = program;

        this.create();
        this.initialize();
    }

    public storeInstance(mat: Mat4, offset: int): void {
        mat.store(this.instanceWorlds, offset * 16);
    }

    public draw(n: int = this.data.capacity): void {
        this.gl.bindVertexArray(this.vertexArrayObject);
        this.bufferDynamicData(this.instanceWorldsBuffer, this.instanceWorlds);
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.data.count, n);
    }

    private create(): void {
        this.createInstanceWorlds();
        this.vertexArrayObject = this.createVertexArrayObject();
        this.instanceWorldsBuffer = this.createBuffer();
        this.verteciesBuffer = this.createBuffer();
        this.colorsBuffer = this.createBuffer();
    }

    private createInstanceWorlds(): void {
        this.instanceWorlds = new Float32Array(this.data.capacity * 16);
    }

    private createVertexArrayObject(): WebGLVertexArrayObject {
        const vao: Nullable<WebGLVertexArrayObject> =
            this.gl.createVertexArray();
        if (!vao) {
            throw new Error("Renderer: Creating vertex array object failed.");
        }
        return vao;
    }

    private createBuffer(): WebGLBuffer {
        const buffer: Nullable<WebGLBuffer> = this.gl.createBuffer();
        if (!buffer) {
            throw new Error("Renderer: Creating buffer failed.");
        }
        return buffer;
    }

    private initialize(): void {
        this.gl.bindVertexArray(this.vertexArrayObject);

        this.allocateDynamicData(
            this.instanceWorldsBuffer,
            this.instanceWorlds
        );
        this.enableInstanceUniform(ShaderVariables.OBJECTWORLD, 16);

        this.bufferStaticData(this.verteciesBuffer, this.data.vertecies);
        this.enableAttribute(ShaderVariables.VERTEXPOSITION, 3);

        this.bufferStaticData(this.colorsBuffer, this.data.colors);
        this.enableAttribute(ShaderVariables.VERTEXCOLOR, 3);

        this.gl.bindVertexArray(null);
    }

    private allocateDynamicData(buffer: WebGLBuffer, data: Float32Array): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            data.byteLength,
            this.gl.DYNAMIC_DRAW
        );
    }

    private bufferDynamicData(buffer: WebGLBuffer, data: Float32Array): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, data);
    }

    private enableInstanceUniform(name: string, stride: int): void {
        const loc: WebGLInstanceUniformLocation =
            this.program.instanceUniformLocations.get(name)!;

        for (let i = 0; i < Math.ceil(stride / 4); ++i) {
            this.gl.enableVertexAttribArray(loc + i);
            this.gl.vertexAttribPointer(
                loc + i,
                4,
                this.gl.FLOAT,
                false,
                stride * 4,
                i * 4 * 4
            );
            this.gl.vertexAttribDivisor(loc + i, 1);
        }
    }

    private bufferStaticData(buffer: WebGLBuffer, data: Float32Array): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    }

    private enableAttribute(name: string, stride: int): void {
        const loc: WebGLAttributeLocation =
            this.program.attributeLocations.get(name)!;
        this.gl.enableVertexAttribArray(loc);
        this.gl.vertexAttribPointer(loc, stride, this.gl.FLOAT, false, 0, 0);
    }
}
