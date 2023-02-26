/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Vec2 {
    public x: float;
    public y: float;

    public constructor(x: float = 0, y: float = 0) {
        this.x = x;
        this.y = y;
    }

    public applyMat(mat: Mat3): Vec2 {
        this.x =
            mat.values[0] * this.x + mat.values[3] * this.y + mat.values[6];
        this.y =
            mat.values[1] * this.x + mat.values[4] * this.y + mat.values[7];
        return this;
    }
}
