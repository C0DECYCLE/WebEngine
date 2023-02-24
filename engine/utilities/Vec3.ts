/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Vec3 extends Vec2 {
    public z: float;

    public constructor(x: float = 0, y: float = 0, z: float = 0) {
        super(x, y);
        this.z = z;
    }
}
