/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class GeometryLod {
        private readonly gl: WebGL2RenderingContext;
        private readonly data: WebEngine.GeometryDataLod;
        private readonly geometry: WebEngine.Geometry;

        private instanceWorlds: Float32Array;
        private instanceStoreCount: int = 0;

        private vertexArrayObject: WebGLVertexArrayObject;
        private instanceWorldsBuffer: WebGLBuffer;
        private verteciesBuffer: WebGLBuffer;
        private colorsBuffer: WebGLBuffer;

        public constructor(
            gl: WebGL2RenderingContext,
            data: WebEngine.GeometryDataLod,
            geometry: WebEngine.Geometry
        ) {
            this.gl = gl;
            this.data = data;
            this.geometry = geometry;
            this.create();
            this.initialize();
        }

        /** @internal */
        public storeInstance(mat: Mat4): void {
            if (this.instanceStoreCount === this.geometry.data.capacity) {
                return warn(
                    `WebEngine.GeometryLod: Geometry capacity overflow. (${this.geometry.data.name})`
                );
            }
            mat.store(this.instanceWorlds, this.instanceStoreCount * 16);
            this.instanceStoreCount++;
        }

        /** @internal */
        public draw(isShadow: boolean): void {
            if (this.instanceStoreCount === 0) {
                return;
            }
            this.gl.bindVertexArray(this.vertexArrayObject);
            this.bufferDynamicData(
                this.instanceWorldsBuffer,
                this.instanceWorlds
            );
            this.gl.drawArraysInstanced(
                this.gl.TRIANGLES,
                0,
                this.data.count,
                this.instanceStoreCount
            );
            this.registerStats(
                isShadow,
                this.data.count * this.instanceStoreCount
            );
            this.instanceStoreCount = 0;
        }

        private create(): void {
            this.createInstanceWorlds();
            this.vertexArrayObject = this.createVertexArrayObject();
            this.instanceWorldsBuffer = this.createBuffer();
            this.verteciesBuffer = this.createBuffer();
            this.colorsBuffer = this.createBuffer();
        }

        private createInstanceWorlds(): void {
            this.instanceWorlds = new Float32Array(
                this.geometry.data.capacity * 16
            );
        }

        private createVertexArrayObject(): WebGLVertexArrayObject {
            const vao: Nullable<WebGLVertexArrayObject> =
                this.gl.createVertexArray();
            if (!vao) {
                throw new Error(
                    "WebEngine.GeometryLod: Creating vertex array object failed."
                );
            }
            return vao;
        }

        private createBuffer(): WebGLBuffer {
            const buffer: Nullable<WebGLBuffer> = this.gl.createBuffer();
            if (!buffer) {
                throw new Error(
                    "WebEngine.GeometryLod: Creating buffer failed."
                );
            }
            return buffer;
        }

        private initialize(): void {
            this.gl.bindVertexArray(this.vertexArrayObject);

            this.allocateDynamicData(
                this.instanceWorldsBuffer,
                this.instanceWorlds
            );
            this.enableInstanceUniform(
                WebEngine.ShaderVariables.OBJECTWORLD,
                16
            );

            this.bufferStaticData(this.verteciesBuffer, this.data.vertecies);
            this.enableAttribute(WebEngine.ShaderVariables.VERTEXPOSITION, 3);

            this.bufferStaticData(this.colorsBuffer, this.data.colors);
            this.enableAttribute(WebEngine.ShaderVariables.VERTEXCOLOR, 3);

            this.gl.bindVertexArray(null);
        }

        private allocateDynamicData(
            buffer: WebGLBuffer,
            data: Float32Array
        ): void {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(
                this.gl.ARRAY_BUFFER,
                data.byteLength,
                this.gl.DYNAMIC_DRAW
            );
        }

        private bufferDynamicData(
            buffer: WebGLBuffer,
            data: Float32Array
        ): void {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, data);
        }

        private enableInstanceUniform(
            name: WebEngine.ShaderVariables,
            stride: int
        ): void {
            const loc: WebGLInstanceUniformLocation =
                this.geometry.program.instanceUniformLocations.get(name)!;

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

        private bufferStaticData(
            buffer: WebGLBuffer,
            data: Float32Array
        ): void {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        }

        private enableAttribute(
            name: WebEngine.ShaderVariables,
            stride: int
        ): void {
            const loc: WebGLAttributeLocation =
                this.geometry.program.attributeLocations.get(name)!;
            this.gl.enableVertexAttribArray(loc);
            this.gl.vertexAttribPointer(
                loc,
                stride,
                this.gl.FLOAT,
                false,
                0,
                0
            );
        }

        private registerStats(isShadow: boolean, n: int): void {
            if (isShadow) {
                this.geometry.geometryManager
                    .getStats()
                    .add("shadowDrawCalls", 1);
                this.geometry.geometryManager
                    .getStats()
                    .add("activeShadowVertecies", n);
            } else {
                this.geometry.geometryManager.getStats().add("drawCalls", 1);
                this.geometry.geometryManager
                    .getStats()
                    .add("activeVertecies", n);
            }
        }
    }
}
