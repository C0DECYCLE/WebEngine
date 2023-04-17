/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class Light {
        public readonly ambient: Vec3 = new Vec3(0, 0, 0);
        public readonly direction: Vec3 = new Vec3(0, -1, 0);
        public readonly color: Vec3 = new Vec3(1, 1, 1);
        public intensity: float = 1.0;

        private readonly ambientColor: Float32Array = new Float32Array(3);
        private readonly lightDirection: Float32Array = new Float32Array(3);
        private readonly lightColor: Float32Array = new Float32Array(3);

        private shadow: Nullable<WebEngine.Shadow>;

        private readonly gl: WebGL2RenderingContext;

        private readonly camera: WebEngine.Camera;

        public constructor(
            gl: WebGL2RenderingContext,
            camera: WebEngine.Camera
        ) {
            this.gl = gl;
            this.camera = camera;
        }

        public setShadow(size: int): WebEngine.Shadow {
            if (this.shadow) {
                throw new Error(
                    "WebEngine.Light: WebEngine.Shadow already enabled."
                );
            }
            this.shadow = new WebEngine.Shadow(this.gl, this.camera, size);
            return this.shadow;
        }

        public getShadow(): Nullable<WebEngine.Shadow> {
            return this.shadow;
        }

        /** @internal */
        public update(): void {
            this.sync();
            if (!this.shadow) {
                return;
            }
            this.shadow.direction.copy(this.direction);
            this.shadow.update();
        }

        /** @internal */
        public bufferMainUniforms(program: WebEngine.ShaderProgram): void {
            this.bufferAmbientColorUniform(program);
            this.bufferLightDirectionUniform(program);
            this.bufferLightColorUniform(program);
            if (!this.shadow) {
                return;
            }
            this.shadow.bufferMainUniforms(program);
        }

        private sync(): void {
            this.ambientColor[0] = this.ambient.x;
            this.ambientColor[1] = this.ambient.y;
            this.ambientColor[2] = this.ambient.z;

            this.lightDirection[0] = this.direction.x * this.intensity;
            this.lightDirection[1] = this.direction.y * this.intensity;
            this.lightDirection[2] = this.direction.z * this.intensity;

            this.lightColor[0] = this.color.x;
            this.lightColor[1] = this.color.y;
            this.lightColor[2] = this.color.z;
        }

        private bufferAmbientColorUniform(
            program: WebEngine.ShaderProgram
        ): void {
            const loc: WebGLUniformLocation = program.uniformLocations.get(
                WebEngine.ShaderVariables.AMBIENTCOLOR
            )!;
            this.gl.uniform3fv(loc, this.ambientColor);
        }

        private bufferLightDirectionUniform(
            program: WebEngine.ShaderProgram
        ): void {
            const loc: WebGLUniformLocation = program.uniformLocations.get(
                WebEngine.ShaderVariables.LIGHTDIRECTION
            )!;
            this.gl.uniform3fv(loc, this.lightDirection);
        }

        private bufferLightColorUniform(
            program: WebEngine.ShaderProgram
        ): void {
            const loc: WebGLUniformLocation = program.uniformLocations.get(
                WebEngine.ShaderVariables.LIGHTCOLOR
            )!;
            this.gl.uniform3fv(loc, this.lightColor);
        }
    }
}
