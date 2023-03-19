/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(new Vec3(0.9, 0.9, 0.9), undefined, true);
    await renderer.initialize(["tree.obj", "house.obj"]);

    const camera: Camera = renderer.getCamera();

    for (let i: int = 0; i < 1000; i++) {
        const tree: Entity = new Entity("tree");
        tree.position
            .set(Math.random(), 0, Math.random())
            .scale(2)
            .sub(1, 0, 1)
            .scale(100);
        tree.attach(renderer);
        tree.wakeUp();
    }

    for (let i: int = 0; i < 100; i++) {
        const house: Entity = new Entity("house");
        house.position
            .set(Math.random(), 0, Math.random())
            .scale(2)
            .sub(1, 0, 1)
            .scale(100);
        house.attach(renderer);
        house.wakeUp();
    }

    function render(now: float): void {
        camera.position.set(-1, 1.5, -1.5).scale(now * 0.001);

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
