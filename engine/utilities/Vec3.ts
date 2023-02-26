/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Vec3 {
    public x: float;
    public y: float;
    public z: float;

    public constructor(x: float = 0, y: float = 0, z: float = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public applyMat(mat: Mat4): Vec3 {
        const w =
            1 /
            (mat.values[3] * this.x +
                mat.values[7] * this.y +
                mat.values[11] * this.z +
                mat.values[15]);

        this.x =
            (mat.values[0] * this.x +
                mat.values[4] * this.y +
                mat.values[8] * this.z +
                mat.values[12]) *
            w;
        this.y =
            (mat.values[1] * this.x +
                mat.values[5] * this.y +
                mat.values[9] * this.z +
                mat.values[13]) *
            w;
        this.z =
            (mat.values[2] * this.x +
                mat.values[6] * this.y +
                mat.values[10] * this.z +
                mat.values[14]) *
            w;
        return this;
    }
}
