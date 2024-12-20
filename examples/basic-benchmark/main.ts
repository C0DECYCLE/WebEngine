/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: WebEngine.Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new WebEngine.Renderer(new Vec3(0.9, 0.9, 0.9));
    await renderer.initialize([], [], [
        //level, coverage minimum, simplify percentage
        [0, 0.25, 1.0] as WebEngine.GeometryLodConfig,
        [1, 0.1, 0.5] as WebEngine.GeometryLodConfig,
        [2, 0.05, 0.25] as WebEngine.GeometryLodConfig,
        [3, 0.01, 0.1] as WebEngine.GeometryLodConfig,
    ] as WebEngine.GeometryLodConfig[]);
    renderer.getStats().show();

    const camera: WebEngine.Camera = renderer.getCamera();
    camera.target.set(0, 0, 0);

    for (let i: int = 0; i < 50_000; i++) {
        const suzanne: WebEngine.Entity = new WebEngine.Entity("suzanne");
        suzanne.position
            .set(Math.random(), Math.random(), Math.random())
            .scale(2)
            .sub(1, 1, 1)
            .scale(20);
        suzanne.rotation.add(Math.random(), Math.random(), Math.random());
        suzanne.attach(renderer);
        suzanne.disableFrustumCulling();
        suzanne.wakeUp();
    }

    const list: ObjectArray<WebEngine.Entity> = renderer
        .getEntityManager()
        .getList();
    const speed: float = 0.01;

    function render(now: float): void {
        camera.position
            .set(Math.cos(now * 0.0001), 0.5, Math.sin(now * 0.0001))
            .scale(40);

        for (let i: int = 0; i < list.length; i++) {
            list[i].rotation.x += speed;
            list[i].rotation.y -= speed;
            list[i].rotation.z -= speed;
        }

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
