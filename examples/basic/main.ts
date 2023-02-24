/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

let renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer();
    await renderer.initialize(new Vec3(0.8, 0.9, 0.8));
});
