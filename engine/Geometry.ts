/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Geometry {
    private readonly gl: WebGL2RenderingContext;

    public constructor(gl: WebGL2RenderingContext, data: GeometryData) {
        this.gl = gl;
    }
}
