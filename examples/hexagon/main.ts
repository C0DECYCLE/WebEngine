/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(new Vec3(0.9, 0.9, 0.9), undefined, true);
    await renderer.initialize([
        "tree.obj",
        "house.obj",
        "field.obj",
        "water.obj",
    ]);

    const camera: Camera = renderer.getCamera();
    camera.target.set(0.1, 0, -0.2).scale(60);
    camera.position.set(0, 1.25, -1).scale(60).add(camera.target);

    const light: Light = renderer.getLight();
    light.ambient.set(0.05, 0.015, 0.1);
    light.direction.set(1.0, -1.0, 0.5).normalize();
    light.color.set(1.0, 0.8, 0.7);

    const map: int[][] = [
        [0, 0, 1, 1, 0, 0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    ];

    for (let z: int = 0; z < map.length; z++) {
        for (let x: int = 0; x < map[0].length; x++) {
            let key;
            if (map[z][x] === 1) key = "field";
            if (!key) {
                continue;
            }
            const field: Entity = new Entity(key);
            field.position.set(-x * 14.9, 0, -z * 17.4);
            field.position.z -= x % 2 == 0 ? 0 : 8.65;
            field.position.x += map[0].length * 0.5 * 14.9;
            field.position.z += map.length * 0.5 * 17.4;
            if (Math.random() > 0.5) field.rotation.y = 180 * toRadian;
            field.attach(renderer);
            field.staticLod(0);
            field.wakeUp();

            if (Math.random() > 0.9) {
                continue;
            }
            if (Math.random() > 0.5) {
                for (let i: int = 0; i < 10; i++) {
                    const tree: Entity = new Entity("tree");
                    tree.position.copy(field.position);
                    tree.position.x += (Math.random() * 2 - 1) * 6;
                    tree.position.z += (Math.random() * 2 - 1) * 6;
                    tree.rotation.y = Math.random() * 360 * toRadian;
                    tree.attach(renderer);
                    tree.staticLod(0);
                    tree.wakeUp();
                }
                continue;
            }
            const house: Entity = new Entity("house");
            house.position.copy(field.position);
            house.position.x += (Math.random() * 2 - 1) * 3;
            house.position.z += (Math.random() * 2 - 1) * 3;
            house.rotation.y = Math.random() * 360 * toRadian;
            house.attach(renderer);
            house.staticLod(0);
            house.wakeUp();
        }
    }

    for (let z: int = 0; z < 10; z++) {
        for (let x: int = 0; x < 10; x++) {
            const water: Entity = new Entity("water");
            water.position.set(-x * 30, -0.3, -z * 30);
            water.position.x += 10 * 15;
            water.position.z += 10 * 15;
            if (Math.random() > 0.5) water.rotation.y = 180 * toRadian;
            water.attach(renderer);
            water.staticLod(0);
            water.wakeUp();
        }
    }

    function render(now: float): void {
        //camera.position.set(0, 1.5, -1.25).scale(now * 0.01);
        light.direction
            .set(-Math.cos(now * 0.0005), Math.sin(now * 0.0005), 0.5)
            .normalize();

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
