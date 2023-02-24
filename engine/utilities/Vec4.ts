/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Vec4 extends Vec3 {
    public w: float;

    public constructor(x: float = 0, y: float = 0, z: float = 0, w: float = 1) {
        super(x, y, z);
        this.w = w;
    }
}
