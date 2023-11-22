/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class Camera {
        public readonly position: Vec3 = new Vec3(0, 0, 0);
        public readonly target: Vec3 = new Vec3(0, 0, -1);
        public readonly up: Vec3 = new Vec3(0, 1, 0);

        private readonly right: Vec3 = new Vec3(1, 0, 0);
        private readonly relativeUp: Vec3 = new Vec3(0, 1, 0);

        private readonly fov: float;
        private readonly ratio: float;
        public readonly near: float;
        public readonly far: float;

        private readonly origin: Vec3 = new Vec3(0, 0, 0);
        private readonly direction: Vec3 = new Vec3(0, 0, -1);
        private readonly cameraPosition: Float32Array = new Float32Array(3);
        private readonly cameraDirection: Float32Array = new Float32Array(3);

        private readonly world: Mat4 = new Mat4();
        private readonly projection: Mat4 = new Mat4();
        private readonly viewProjection: Mat4 = new Mat4();

        private frustum: WebEngine.Frustum;
        private readonly frustumRadiusScale: float;

        private readonly gl: WebGL2RenderingContext;

        public constructor(
            gl: WebGL2RenderingContext,
            far: float = 10_000,
            frustumRadiusScale: float = 1.5
        ) {
            this.gl = gl;
            this.fov = 60 * toRadian;
            this.ratio = this.gl.canvas.width / this.gl.canvas.height;
            this.near = 1;
            this.far = far;
            this.projection.perspective(
                this.fov,
                this.ratio,
                this.near,
                this.far
            );
            this.createFrustum();
            this.frustumRadiusScale = frustumRadiusScale;
        }

        /** @internal */
        public inFrustum(position: Vec3, radius: float): boolean {
            radius *= this.frustumRadiusScale;
            return (
                this.inFrontOfPlane(this.frustum.left, position, radius) &&
                this.inFrontOfPlane(this.frustum.right, position, radius) &&
                this.inFrontOfPlane(this.frustum.top, position, radius) &&
                this.inFrontOfPlane(this.frustum.bottom, position, radius)
            );
        }

        /** @internal */
        public update(): void {
            this.computeVectors();
            this.computeMatricies();
            this.computeFrustum();
        }

        /** @internal */
        public bufferMainUniforms(program: WebEngine.ShaderProgram): void {
            this.bufferCameraPositionUniform(program);
            this.bufferCameraDirectionUniform(program);
            this.bufferViewProjectionUniform(program);
        }

        private createFrustum(): void {
            this.frustum = {
                left: this.createPlane(),
                right: this.createPlane(),
                top: this.createPlane(),
                bottom: this.createPlane(),
            } as WebEngine.Frustum;
        }

        private createPlane(): WebEngine.Plane {
            return {
                position: new Vec3(),
                normal: new Vec3(),
            } as WebEngine.Plane;
        }

        private computeVectors(): void {
            this.direction.copy(this.target).sub(this.position).normalize();
            this.up.normalize();
            this.right.copy(this.direction).cross(this.up).normalize();
            this.relativeUp.copy(this.direction).cross(this.right).normalize();

            this.cameraPosition[0] = this.position.x;
            this.cameraPosition[1] = this.position.y;
            this.cameraPosition[2] = this.position.z;

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

        private computeFrustum(): void {
            const hHeight: float = this.far * Math.tan(this.fov * 0.55);
            const hWidth: float = hHeight * this.ratio;

            const right: Vec3 = this.right;
            const rUp: Vec3 = this.relativeUp;
            const dirFar: Vec3 = this.direction.clone().scale(this.far);
            const fr: WebEngine.Frustum = this.frustum;

            this.computePlane(fr.left, right, hWidth, dirFar, rUp, -1);
            this.computePlane(fr.right, right, -hWidth, dirFar, rUp, 1);
            this.computePlane(fr.bottom, rUp, hHeight, dirFar, right, 1);
            this.computePlane(fr.top, rUp, -hHeight, dirFar, right, -1);
        }

        private computePlane(
            plane: WebEngine.Plane,
            right: Vec3,
            half: float,
            directionFar: Vec3,
            up: Vec3,
            flip: float
        ): void {
            plane.position.copy(this.position);
            plane.normal
                .copy(right)
                .scale(half)
                .sub(directionFar)
                .scale(-1)
                .normalize()
                .cross(up)
                .scale(flip);
        }

        private inFrontOfPlane(
            plane: WebEngine.Plane,
            position: Vec3,
            radius: float
        ): boolean {
            return (
                Vec3.Dot(plane.normal, position) -
                    Vec3.Dot(plane.normal, plane.position) >
                -radius
            );
        }

        private bufferCameraPositionUniform(
            program: WebEngine.ShaderProgram
        ): void {
            const loc: WebGLUniformLocation = program.uniformLocations.get(
                WebEngine.ShaderVariables.CAMERAPOSITION
            )!;
            this.gl.uniform3fv(loc, this.cameraPosition);
        }

        private bufferCameraDirectionUniform(
            program: WebEngine.ShaderProgram
        ): void {
            const loc: WebGLUniformLocation = program.uniformLocations.get(
                WebEngine.ShaderVariables.CAMERADIRECTION
            )!;
            this.gl.uniform3fv(loc, this.cameraDirection);
        }

        private bufferViewProjectionUniform(
            program: WebEngine.ShaderProgram
        ): void {
            const loc: WebGLUniformLocation = program.uniformLocations.get(
                WebEngine.ShaderVariables.VIEWPROJECTION
            )!;
            this.gl.uniformMatrix4fv(loc, false, this.viewProjection.values);
        }
    }
}
