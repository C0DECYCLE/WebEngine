/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Camera {
    public readonly projection: Mat4;

    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext, far: float) {
        this.gl = gl;
        this.projection = Mat4.Perspective(
            60 * toRadian,
            this.gl.canvas.width / this.gl.canvas.height,
            1,
            far
        );
    }
}
