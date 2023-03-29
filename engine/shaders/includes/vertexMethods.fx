/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

mat4 cleanWorld() {
    mat4 world = objectWorld;
    world[0][3] = 0.0;
    world[1][3] = 0.0;
    world[2][3] = 0.0;
    world[3][3] = 1.0;
    return world;
}
