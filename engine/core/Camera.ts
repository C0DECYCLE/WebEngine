/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Camera {
    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly target: Vec3 = new Vec3(0, 0, -1);
    public readonly up: Vec3 = new Vec3(0, 1, 0);

    private readonly right: Vec3 = new Vec3(1, 0, 0);

    private readonly fov: float;
    private readonly ratio: float;
    private readonly near: float;
    private readonly far: float;

    private readonly origin: Vec3 = new Vec3(0, 0, 0);
    private readonly direction: Vec3 = new Vec3(0, 0, -1);

    private readonly world: Mat4 = new Mat4();
    private readonly projection: Mat4 = new Mat4();
    private readonly cameraDirection: Float32Array = new Float32Array(3);
    private readonly viewProjection: Mat4 = new Mat4();

    //private frustum: Frustum;

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext, far: float = 1_000) {
        this.gl = gl;
        this.fov = 60 * toRadian;
        this.ratio = this.gl.canvas.width / this.gl.canvas.height;
        this.near = 1;
        this.far = far;
        this.projection.perspective(this.fov, this.ratio, this.near, this.far);
        //this.createFrustum();
    }

    public update(): void {
        this.computeVectors();
        this.computeMatricies();
        //this.computeFrustum();
    }

    /*
        public inFrustum(position: Vec3, radius: float): boolean {
            return (
                //this.inFrontOfPlane(this.frustum.left, position, radius); &&
                //this.inFrontOfPlane(this.frustum.right, position, radius) &&
                this.inFrontOfPlane(this.frustum.far, position, radius) &&
                this.inFrontOfPlane(this.frustum.near, position, radius) &&
                this.inFrontOfPlane(this.frustum.top, position, radius) &&
                this.inFrontOfPlane(this.frustum.bottom, position, radius)
            );
        }
        */

    public bufferMainUniforms(program: ShaderProgram): void {
        this.bufferCameraDirectionUniform(program);
        this.bufferViewProjectionUniform(program);
    }

    /*
        private createFrustum(): void {
            this.frustum = {
                near: this.createPlane(),
                far: this.createPlane(),
                right: this.createPlane(),
                left: this.createPlane(),
                top: this.createPlane(),
                bottom: this.createPlane(),
            } as Frustum;
            this.computeVectors();
            this.computeMatricies();
            this.computeFrustum();
        }

        private createPlane(): Plane {
            return {
                position: new Vec3(),
                normal: new Vec3(),
            } as Plane;
        }
        */

    private computeVectors(): void {
        this.direction.copy(this.target).sub(this.position).normalize();
        this.up.normalize();
        this.right.copy(this.direction).cross(this.up);

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

    /*
        private computeFrustum(): void {
            const halfHeight: float = this.far * Math.tan(this.fov * 0.5);
            const halfWidth: float = halfHeight * this.ratio;
            const directionFar: Vec3 = this.direction.clone().scale(this.far);

            this.frustum.near.position
                .copy(this.direction)
                .scale(this.near)
                .add(this.position);
            this.frustum.near.normal.copy(this.direction);

            this.frustum.far.position.copy(directionFar).add(this.position);
            this.frustum.far.normal.copy(this.direction).scale(-1);

            this.frustum.right.position.copy(this.position);
            this.frustum.right.normal
                .copy(this.right)
                .scale(halfWidth)
                .sub(directionFar)
                .scale(-1)
                .cross(this.up);

            this.frustum.left.position.copy(this.position);
            this.frustum.left.normal
                .copy(this.right)
                .scale(halfWidth)
                .add(directionFar)
                .cross(this.frustum.left.normal, this.up);

            this.frustum.top.position.copy(this.position);
            this.frustum.top.normal
                .copy(this.up)
                .scale(halfHeight)
                .sub(directionFar)
                .scale(-1)
                .cross(this.frustum.top.normal, this.right);

            this.frustum.bottom.position.copy(this.position);
            this.frustum.bottom.normal
                .copy(this.up)
                .scale(halfHeight)
                .add(directionFar)
                .cross(this.right);
        }

        private inFrontOfPlane(
            plane: Plane,
            position: Vec3,
            radius: float
        ): boolean {
            return (
                Vec3.Dot(plane.normal, position) -
                    Vec3.Dot(plane.normal, plane.position) >
                -radius
            );
        }
        */

    private bufferCameraDirectionUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.CAMERADIRECTION
        )!;
        this.gl.uniform3fv(loc, this.cameraDirection);
    }

    private bufferViewProjectionUniform(program: ShaderProgram): void {
        const loc: WebGLUniformLocation = program.uniformLocations.get(
            ShaderVariables.VIEWPROJECTION
        )!;
        this.gl.uniformMatrix4fv(loc, false, this.viewProjection.values);
    }
}
