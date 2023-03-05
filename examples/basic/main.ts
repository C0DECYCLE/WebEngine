/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/
let renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(new Vec3(0.9, 0.9, 0.9));
    await renderer.initialize();

    const camera: Camera = renderer.getCamera();
    camera.position.set(25, 25, 25);
    camera.target.set(0, 0, 0);

    //TODO: stats, messure draw calls?
    //GITHUB TODO: lights, shadows, etc.. other game engine features

    for (let i: int = 0; i < 10_000; i++) {
        const suzanne: Entity = new Entity("suzanne");
        suzanne.position
            .set(Math.random(), Math.random(), Math.random())
            .scale(20);
        suzanne.attach(renderer);
        suzanne.wakeUp();
    }

    function render(now: float): void {
        for (let i: int = 0; i < renderer.entityManager.list.length; i++) {
            renderer.entityManager.list[i].rotation.add(0.01, -0.1, -0.01);
        }

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
