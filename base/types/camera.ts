/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export type Plane = {
        position: Vec3;
        normal: Vec3;
    };

    export type Frustum = {
        top: WebEngine.Plane;
        bottom: WebEngine.Plane;
        right: WebEngine.Plane;
        left: WebEngine.Plane;
        far: WebEngine.Plane;
        near: WebEngine.Plane;
    };
}
