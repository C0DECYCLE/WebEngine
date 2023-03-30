/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(new Vec3(0.9, 0.9, 0.9));
    await renderer.initialize(["tree.obj"]);
    renderer.getStats().show();

    const camera: Camera = renderer.getCamera();
    camera.target.set(0, 0, 0);
    camera.position.set(0, 3, -3);

    const light: Light = renderer.getLight();
    light.ambient.set(0.2, 0.1, 0.3);
    light.direction.set(1.5, -1.0, 0.0).normalize();
    light.color.set(1.0, 0.9, 0.8);

    /*
    const shadow: Shadow = light.setShadow(1024);
    shadow.position.set(0, 0, 0);
    shadow.radius = 256;
    shadow.bias = 0.005;
    shadow.opcaity = 0.65;
    */

    const monkey: Entity = new Entity("suzanne");
    monkey.attach(renderer);
    monkey.position.set(0, 20, 0);
    monkey.rotation.set(0, 180 * toRadian, 0);
    monkey.wakeUp();

    for (let i: int = 0; i < 50_000; i++) {
        const tree: Entity = new Entity("tree");
        tree.attach(renderer);
        tree.position
            .set(Math.random(), 0, Math.random())
            .scale(2)
            .sub(1, 0, 0.5)
            .scale(500);
        tree.position.y = Math.random() * 10;
        tree.rotation.set(0, Math.random() * 360 * toRadian, 0);
        tree.wakeUp();
    }

    const speed: float = 0.2;

    function render(now: float): void {
        monkey.rotation.add(speed, speed, speed);

        camera.position.z -= speed;
        camera.position.y += speed * 0.5;

        //shadow.position.copy(camera.position);

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
