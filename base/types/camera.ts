/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

type Plane = {
    position: Vec3;
    normal: Vec3;
};

type Frustum = {
    top: Plane;
    bottom: Plane;
    right: Plane;
    left: Plane;
    far: Plane;
    near: Plane;
};
