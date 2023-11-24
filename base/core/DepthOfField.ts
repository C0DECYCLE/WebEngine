/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class DepthOfField {
        public FOCAL_LENGTH: float = 10.0;
        public FOCUS_DISTANCE: float = 80.0;
        public FSTOP: float = 6.0;

        private MAGNIFICATION: float;
        private BLUR_COEFFICIENT: float;
        private readonly PPM: float;
        private readonly DEPTH_RANGE: Vec2;

        private readonly gl: WebGL2RenderingContext;
        private readonly program: WebEngine.ShaderProgram;
        private readonly camera: WebEngine.Camera;

        private mainFrameBuffer: WebGLFramebuffer;
        private mainColorTexture: WebGLTexture;
        private mainDepthTexture: WebGLTexture;

        private horizontalBlurFrameBuffer: WebGLFramebuffer;
        private horizontalBlurTexture: WebGLTexture;

        private quadVertexArray: WebGLVertexArrayObject;

        public constructor(
            gl: WebGL2RenderingContext,
            program: WebEngine.ShaderProgram,
            camera: WebEngine.Camera
        ) {
            this.gl = gl;
            this.program = program;
            this.camera = camera;

            this.PPM =
                Math.sqrt(
                    this.gl.canvas.width * this.gl.canvas.width +
                        this.gl.canvas.height * this.gl.canvas.height
                ) / 35;
            this.DEPTH_RANGE = new Vec2(this.camera.near, this.camera.far);

            this.createMainFrameBuffer();
            this.createHorizontalBlurFrameBuffer();
            this.createQuadVertexArray();
        }

        /** @internal */
        public preMainDraw(): void {
            this.updateUniforms();
            this.activateTextures();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.mainFrameBuffer);
        }

        /** @internal */
        public postMainDraw(): void {
            this.gl.useProgram(this.program.program);
            this.bufferStaticUniforms();
            this.bufferDynamicUniforms();
            this.horizontalBlurPass();
            this.verticalBlurPass();
        }

        private createMainFrameBuffer(): void {
            const mainFrameBuffer: Nullable<WebGLFramebuffer> =
                this.gl.createFramebuffer();
            if (!mainFrameBuffer) {
                throw new Error(
                    "WebEngine.DepthOfField: Creating main frame buffer failed."
                );
            }
            this.mainFrameBuffer = mainFrameBuffer;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.mainFrameBuffer);
            //this.gl.activeTexture(this.gl.TEXTURE0);
            this.createMainColorTexture();
            this.createMainDepthTexture();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }

        private createMainColorTexture(): void {
            const colorTexture: Nullable<WebGLTexture> =
                this.gl.createTexture();
            if (!colorTexture) {
                throw new Error(
                    "WebEngine.DepthOfField: Creating main color texture failed."
                );
            }
            this.mainColorTexture = colorTexture;
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainColorTexture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MAG_FILTER,
                this.gl.NEAREST
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MIN_FILTER,
                this.gl.NEAREST
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_S,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_T,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texStorage2D(
                this.gl.TEXTURE_2D,
                1,
                this.gl.RGBA8,
                this.gl.drawingBufferWidth,
                this.gl.drawingBufferHeight
            );
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.COLOR_ATTACHMENT0,
                this.gl.TEXTURE_2D,
                colorTexture,
                0
            );
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }

        private createMainDepthTexture(): void {
            const depthTexture: Nullable<WebGLTexture> =
                this.gl.createTexture();
            if (!depthTexture) {
                throw new Error(
                    "WebEngine.DepthOfField: Creating main depth texture failed."
                );
            }
            this.mainDepthTexture = depthTexture;
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainDepthTexture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MAG_FILTER,
                this.gl.NEAREST
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MIN_FILTER,
                this.gl.NEAREST
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_S,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_T,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texStorage2D(
                this.gl.TEXTURE_2D,
                1,
                this.gl.DEPTH_COMPONENT32F,
                this.gl.drawingBufferWidth,
                this.gl.drawingBufferHeight
            );
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.DEPTH_ATTACHMENT,
                this.gl.TEXTURE_2D,
                depthTexture,
                0
            );
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);

            this.gl.activeTexture(this.gl.TEXTURE2);
            this.gl.bindTexture(this.gl.TEXTURE_2D, depthTexture);
        }

        private createHorizontalBlurFrameBuffer(): void {
            const horizontalBlurFrameBuffer: Nullable<WebGLFramebuffer> =
                this.gl.createFramebuffer();
            if (!horizontalBlurFrameBuffer) {
                throw new Error(
                    "WebEngine.DepthOfField: Creating horizonal blur frame buffer failed."
                );
            }
            this.horizontalBlurFrameBuffer = horizontalBlurFrameBuffer;
            this.gl.bindFramebuffer(
                this.gl.FRAMEBUFFER,
                this.horizontalBlurFrameBuffer
            );

            this.createHorizontalBlurTexture();

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }

        private createHorizontalBlurTexture(): void {
            const horizontalBlurTexture: Nullable<WebGLTexture> =
                this.gl.createTexture();
            if (!horizontalBlurTexture) {
                throw new Error(
                    "WebEngine.DepthOfField: Creating horizonal blur texture failed."
                );
            }
            this.horizontalBlurTexture = horizontalBlurTexture;
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.horizontalBlurTexture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MAG_FILTER,
                this.gl.NEAREST
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MIN_FILTER,
                this.gl.NEAREST
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_S,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_T,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texStorage2D(
                this.gl.TEXTURE_2D,
                1,
                this.gl.RGBA8,
                this.gl.drawingBufferWidth,
                this.gl.drawingBufferHeight
            );
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.COLOR_ATTACHMENT0,
                this.gl.TEXTURE_2D,
                horizontalBlurTexture,
                0
            );
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);

            this.gl.activeTexture(this.gl.TEXTURE3);
            this.gl.bindTexture(this.gl.TEXTURE_2D, horizontalBlurTexture);
        }

        private createQuadVertexArray(): void {
            const vao: Nullable<WebGLVertexArrayObject> =
                this.gl.createVertexArray();
            if (!vao) {
                throw new Error(
                    "WebEngine.DepthOfField: Creating vertex array object failed."
                );
            }
            this.quadVertexArray = vao;
            this.gl.bindVertexArray(vao);

            this.createAndBufferQuadBuffer();

            this.gl.bindVertexArray(null);
        }

        private createAndBufferQuadBuffer(): void {
            const data: Float32Array = new Float32Array([
                -1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1,
            ]);
            const buffer: Nullable<WebGLBuffer> = this.gl.createBuffer();
            if (!buffer) {
                throw new Error(
                    "WebEngine.DepthOfField: Creating buffer failed."
                );
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

            const loc: WebGLAttributeLocation =
                this.program.attributeLocations.get(
                    WebEngine.ShaderVariables.VERTEXPOSITION
                )!;
            this.gl.enableVertexAttribArray(loc);
            this.gl.vertexAttribPointer(loc, 2, this.gl.FLOAT, false, 0, 0);
        }

        private updateUniforms(): void {
            this.MAGNIFICATION =
                this.FOCAL_LENGTH /
                Math.abs(this.FOCUS_DISTANCE - this.FOCAL_LENGTH);
            this.BLUR_COEFFICIENT =
                (this.FOCAL_LENGTH * this.MAGNIFICATION) / this.FSTOP;
        }

        private activateTextures(): void {
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainColorTexture);

            this.gl.activeTexture(this.gl.TEXTURE2);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainDepthTexture);

            this.gl.activeTexture(this.gl.TEXTURE3);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.horizontalBlurTexture);
        }

        private bufferStaticUniforms(): void {
            const locs: MapS<WebGLUniformLocation> =
                this.program.uniformLocations;
            this.gl.uniform1f(
                locs.get(WebEngine.ShaderVariables.PPM)!,
                this.PPM
            );
            this.gl.uniform2fv(
                locs.get(WebEngine.ShaderVariables.DEPTHRANGE)!,
                [this.DEPTH_RANGE.x, this.DEPTH_RANGE.y]
            );
            this.gl.uniform2fv(
                locs.get(WebEngine.ShaderVariables.RESOLUTION)!,
                [this.gl.canvas.width, this.gl.canvas.height]
            );
            this.gl.uniform1i(locs.get(WebEngine.ShaderVariables.DEPTH)!, 2);
        }

        private bufferDynamicUniforms(): void {
            const locs: MapS<WebGLUniformLocation> =
                this.program.uniformLocations;
            this.gl.uniform1f(
                locs.get(WebEngine.ShaderVariables.FOCUSDISTANCE)!,
                this.FOCUS_DISTANCE
            );
            this.gl.uniform1f(
                locs.get(WebEngine.ShaderVariables.BLURCOEFFICIENT)!,
                this.BLUR_COEFFICIENT
            );
        }

        private horizontalBlurPass(): void {
            const locs: MapS<WebGLUniformLocation> =
                this.program.uniformLocations;
            this.gl.bindFramebuffer(
                this.gl.FRAMEBUFFER,
                this.horizontalBlurFrameBuffer
            );
            this.gl.bindVertexArray(this.quadVertexArray);
            this.gl.uniform1i(locs.get(WebEngine.ShaderVariables.COLOR)!, 1);
            this.gl.uniform2fv(
                locs.get(WebEngine.ShaderVariables.TEXELOFFSET)!,
                [1, 0]
            );
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }

        private verticalBlurPass(): void {
            const locs: MapS<WebGLUniformLocation> =
                this.program.uniformLocations;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.bindVertexArray(this.quadVertexArray);
            this.gl.uniform1i(locs.get(WebEngine.ShaderVariables.COLOR)!, 3);
            this.gl.uniform2fv(
                locs.get(WebEngine.ShaderVariables.TEXELOFFSET)!,
                [0, 1]
            );
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }
    }
}
