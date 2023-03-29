/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(new Vec3(0.9, 0.9, 0.9), undefined, false);
    await renderer.initialize(
        [
            "models/tree.obj",
            "models/house.obj",
            "models/field.obj",
            "models/water.obj",
            "models/sand.obj",
        ],
        ["shaders/water"]
    );

    const camera: Camera = renderer.getCamera();
    camera.target.set(-0.1, 0, -0.25).scale(80);

    const zoomSpeed: float = 0.025;
    let zoom: float = 40;
    addEventListener("wheel", (event: WheelEvent) => {
        zoom += event.deltaY * zoomSpeed;
        zoom = zoom.clamp(20, 60);
        camera.position.set(0, 1.25, -1.0).scale(zoom).add(camera.target);
    });
    camera.position.set(0, 1.25, -1.0).scale(zoom).add(camera.target);

    const dragSpeed: float = 0.15;
    let dragging: boolean = false;
    addEventListener("mousedown", (_event: MouseEvent) => (dragging = true));
    addEventListener("mouseup", (_event: MouseEvent) => (dragging = false));
    addEventListener("mousemove", (event: MouseEvent) => {
        if (!dragging) {
            return;
        }
        camera.target.add(
            event.movementX * dragSpeed * zoom * 0.015,
            0.0,
            event.movementY * dragSpeed * zoom * 0.015
        );
        camera.target.x = camera.target.x.clamp(-80, 140);
        camera.target.z = camera.target.z.clamp(-140, 100);
        camera.position.set(0, 1.25, -1.0).scale(zoom).add(camera.target);
    });

    const light: Light = renderer.getLight();
    light.ambient.set(0.15, 0.05, 0.2);
    light.direction.set(1.5, -0.75, 0.25).normalize();
    light.color.set(1.0, 0.85, 0.75);

    const shadow = light.setShadow(1024);
    shadow.position.set(0.15, 0, 0.3).scale(80);
    shadow.radius = 85;
    shadow.bias = 0.001;
    shadow.opcaity = 0.65;

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
            field.shadow(true, true);
            field.wakeUp();

            if (Math.random() > 0.5) {
                for (let i: int = 0; i < 8; i++) {
                    const tree: Entity = new Entity("tree");
                    tree.position.copy(field.position);
                    tree.position.x += (Math.random() * 2 - 1) * 8;
                    tree.position.y += 0.5;
                    tree.position.z += (Math.random() * 2 - 1) * 8;
                    tree.rotation.y = Math.random() * 360 * toRadian;
                    tree.attach(renderer);
                    tree.shadow(true, true);
                    tree.wakeUp();
                }
                continue;
            }
            const house: Entity = new Entity("house");
            house.position.copy(field.position);
            house.position.x += (Math.random() * 2 - 1) * 3;
            house.position.y += 0.5;
            house.position.z += (Math.random() * 2 - 1) * 3;
            house.rotation.y = Math.random() * 360 * toRadian;
            house.attach(renderer);
            house.shadow(true, true);
            house.wakeUp();
        }
    }

    for (let z: int = 0; z < 8; z++) {
        for (let x: int = 0; x < 10; x++) {
            const water: Entity = new Entity("water");
            water.position.set(-x * 60, -2.0, -z * 60);
            water.position.x += 5 * 60;
            water.position.z += 4 * 60;
            if (x % 2 == 0) water.rotation.y = 180 * toRadian;
            water.attach(renderer);
            water.setViewCulling(-0.15);
            water.staticLod(0);
            water.shadow(false, true);
            water.wakeUp();

            const sand: Entity = new Entity("sand");
            sand.position.set(-x * 60, 0.0, -z * 60);
            sand.position.x += 5 * 60;
            sand.position.z += 4 * 60;
            sand.attach(renderer);
            sand.setViewCulling(-0.15);
            sand.shadow(false, false);
            sand.wakeUp();
        }
    }

    function render(now: float): void {
        shadow.position.copy(camera.target).add(0.0, 0.0, zoom);
        shadow.position.x = Math.round(shadow.position.x / 10) * 10;
        shadow.position.y = Math.round(shadow.position.y / 10) * 10;
        shadow.position.z = Math.round(shadow.position.z / 10) * 10;
        shadow.radius = Math.round((zoom * 2.5) / 10) * 10;

        renderer.render(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
