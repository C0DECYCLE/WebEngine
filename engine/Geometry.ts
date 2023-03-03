/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Geometry {
    public readonly capacity: int;
    public readonly instanceWorlds: Float32Array;

    public readonly data: GeometryData;
    public readonly program: ShaderProgram;

    private readonly vertexCount: int;

    private readonly gl: WebGL2RenderingContext;
    private vertexArrayObject: WebGLVertexArrayObject;
    private instanceWorldsBuffer: WebGLBuffer;
    private verteciesBuffer: WebGLBuffer;

    public constructor(
        gl: WebGL2RenderingContext,
        data: GeometryData,
        program: ShaderProgram,
        capacity: int
    ) {
        this.gl = gl;
        this.data = data;
        this.program = program;
        this.capacity = capacity;

        this.instanceWorlds = new Float32Array(this.capacity * 16);
        this.vertexCount = this.data.vertecies.length / 3;

        this.create();
        this.initialize();
    }

    public draw(n: int): void {
        this.gl.bindVertexArray(this.vertexArrayObject);
        this.bufferDynamicData(this.instanceWorldsBuffer, this.instanceWorlds);
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.vertexCount, n);
    }

    private create(): void {
        this.vertexArrayObject = this.createVertexArrayObject();
        this.instanceWorldsBuffer = this.createBuffer();
        this.verteciesBuffer = this.createBuffer();
    }

    private initialize(): void {
        this.gl.bindVertexArray(this.vertexArrayObject);

        this.allocateDynamicData(
            this.instanceWorldsBuffer,
            this.instanceWorlds
        );
        this.enableInstanceUniform("objectWorld", 16);

        this.bufferStaticData(this.verteciesBuffer, this.data.vertecies);
        this.enableAttribute("vertexPosition", 3);

        this.gl.bindVertexArray(null);
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

    private allocateDynamicData(buffer: WebGLBuffer, data: Float32Array): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            data.byteLength,
            this.gl.DYNAMIC_DRAW
        );
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

    private bufferDynamicData(buffer: WebGLBuffer, data: Float32Array): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, data);
    }
}
