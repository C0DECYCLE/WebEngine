/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

const clearColor: Vec3 = new Vec3(0.9, 0.9, 0.9);

let renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(clearColor);
    await renderer.initialize();

    const camera: Camera = renderer.camera;
    camera.position.set(1, 1.5, 2);
    camera.target.set(0, 0, 0);

    function render(now: float): void {
        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
