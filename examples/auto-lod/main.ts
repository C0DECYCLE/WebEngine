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
    camera.target.set(0, 0, 0);
    camera.position.set(0, 0, -3);

    const bunny: Entity = new Entity("suzanne");
    bunny.attach(renderer);
    bunny.position.set(1, 0, 0);
    bunny.rotation.set(0, 180 * toRadian, 0);
    bunny.wakeUp();

    const bunny2: Entity = new Entity("torus");
    bunny2.attach(renderer);
    bunny2.position.set(-1, 0, 0);
    bunny2.rotation.set(0, 180 * toRadian, 0);
    bunny2.wakeUp();

    const speed: float = 0.005;

    function render(now: float): void {
        bunny.rotation.add(speed, speed, speed);
        bunny2.rotation.add(speed, speed, speed);

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});

const testwrap: GeometryWrapData = {
    positions: [
        [0.01, 0.02, 0.03],
        [0.11, 0.12, 0.13],
        [0.21, 0.22, 0.23],
        [0.31, 0.32, 0.33],
        [0.41, 0.42, 0.43],
        [0.51, 0.52, 0.53],
        [0.21, 0.22, 0.23],
    ],
    cells: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 6, 6],
    ],
};