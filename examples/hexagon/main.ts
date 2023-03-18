/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(new Vec3(0.9, 0.9, 0.9));
    await renderer.initialize();

    const camera: Camera = renderer.getCamera();
    camera.position.set(0, 0, -2);

    const monkey: Entity = new Entity("suzanne");
    monkey.rotation.set(0, 180 * toRadian, 0);
    monkey.attach(renderer);
    monkey.wakeUp();

    const speed: float = 0.01;

    function render(now: float): void {
        monkey.rotation.add(speed, speed, speed);

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
