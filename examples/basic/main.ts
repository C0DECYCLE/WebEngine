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
    camera.target.set(0, 0, 0);

    //TODO: stats, messure draw calls?
    //GITHUB TODO: lights, shadows, etc.. other game engine features

    for (let i: int = 0; i < 10_000; i++) {
        const suzanne: Entity = new Entity("suzanne");
        suzanne.position
            .set(Math.random(), Math.random(), Math.random())
            .scale(2)
            .sub(1, 1, 1)
            .scale(20);
        suzanne.attach(renderer);
        suzanne.wakeUp();
    }

    const list: ObjectArray<Entity> = renderer.getEntityManager().getList();
    const speed: float = 0.01;

    function render(now: float): void {
        camera.position
            .set(Math.cos(now * 0.0001), 0.5, Math.sin(now * 0.0001))
            .scale(40);

        let i: int;
        for (i = 0; i < list.length; i++) {
            list[i].rotation.x += speed;
            list[i].rotation.y -= speed;
            list[i].rotation.z -= speed;
        }

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
