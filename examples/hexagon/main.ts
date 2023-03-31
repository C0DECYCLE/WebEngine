/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new Renderer(new Vec3(0.9, 0.9, 0.9));
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
    //renderer.getStats().show();

    const ui: Interface = renderer.getInterface();

    const camera: Camera = renderer.getCamera();
    camera.target.set(-0.1, 0, -0.25).scale(80);

    const zoomSpeed: float = 0.025;
    let zoom: float = 40;

    Interface.Event<WheelEvent>(ui, "wheel", (event: WheelEvent) => {
        zoom += event.deltaY * zoomSpeed;
        zoom = zoom.clamp(20, 60);
        camera.position.set(0, 1.25, -1.0).scale(zoom).add(camera.target);
    });

    camera.position.set(0, 1.25, -1.0).scale(zoom).add(camera.target);

    const dragSpeed: float = 0.15;
    let dragging: boolean = false;

    const dragStart = (event: PointerEvent) => {
        dragging = true;
    };

    const dragStop = (event: PointerEvent) => {
        dragging = false;
    };

    const dragMove = (event: PointerEvent) => {
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
    };

    Interface.Event<PointerEvent>(ui, "pointerdown", dragStart);
    Interface.Event<PointerEvent>(ui, "pointermove", dragMove);
    Interface.Event<PointerEvent>(ui, "pointerup", dragStop);
    Interface.Event<PointerEvent>(ui, "pointerout", dragStop);
    Interface.Event<PointerEvent>(ui, "pointercancel", dragStop);

    const light: Light = renderer.getLight();
    light.ambient.set(0.15, 0.05, 0.2);
    light.direction.set(1.5, -0.75, 0.25).normalize();
    light.color.set(1.0, 0.85, 0.75);

    const shadow: Shadow = light.setShadow(1024);
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
            water.staticLod(0);
            water.shadow(false, true);
            water.wakeUp();

            const sand: Entity = new Entity("sand");
            sand.position.set(-x * 60, 0.0, -z * 60);
            sand.position.x += 5 * 60;
            sand.position.z += 4 * 60;
            sand.attach(renderer);
            sand.shadow(false, false);
            sand.wakeUp();
        }
    }

    /*
    const rect: InterfaceRectangle = new InterfaceRectangle("rect");
    rect.position.set(50, 50);
    rect.size.set(200, 100);
    rect.color = "#FF0000";
    ui.add(rect);
    */

    const offset: float = 20;
    const scale: float = Renderer.Height / 900;

    const img1: InterfaceImage = new InterfaceImage("image1");
    img1.source = "images/test1.png";

    Interface.GetImageSize(img1.source, (result: Vec2) => {
        img1.size.copy(result).scale(scale);
        img1.position
            .set(Renderer.Width as float, Renderer.Height as float)
            .sub(img1.size)
            .sub(offset, offset);
        ui.add(img1);
    });

    Interface.Event<PointerEvent>(img1, "pointerdown", (_event: Event) => {});

    const img2: InterfaceImage = new InterfaceImage("image2");
    img2.source = "images/test2.png";

    Interface.GetImageSize(img2.source, (result: Vec2) => {
        img2.size.copy(result).scale(scale);
        img2.position.set(Renderer.Width - img2.size.x - offset, offset);
        ui.add(img2);
    });

    Interface.Event<PointerEvent>(img2, "pointerdown", (_event: Event) => {});

    const img3: InterfaceImage = new InterfaceImage("image3");
    img3.source = "images/test3.png";

    Interface.GetImageSize(img3.source, (result: Vec2) => {
        img3.size.copy(result).scale(scale);
        img3.position.set(offset, offset);
        ui.add(img3);
    });

    Interface.Event<PointerEvent>(img3, "pointerdown", (_event: Event) => {});

    const btn: InterfaceImage = new InterfaceImage("button");
    btn.source = "images/button.png";

    let fixedSize: Vec2 = new Vec2();
    let fixedPosition: Vec2 = new Vec2();

    Interface.GetImageSize(btn.source, (result: Vec2) => {
        btn.size.copy(result).scale(scale);
        fixedSize.copy(btn.size);
        btn.position
            .set(230 - result.x * 0.5, 100)
            .scale(scale)
            .add(img1.position);
        fixedPosition.copy(btn.position);
        ui.add(btn);
    });

    const down = (_event: PointerEvent) => {
        btn.size.copy(fixedSize).scale(0.8);
        btn.position.add(fixedSize.x * 0.5 - btn.size.x * 0.5, 0);
    };

    const up = (_event: PointerEvent) => {
        btn.size.copy(fixedSize);
        btn.position.copy(fixedPosition);
    };

    Interface.Event<PointerEvent>(btn, "pointerdown", down);
    Interface.Event<PointerEvent>(btn, "pointerup", up);
    Interface.Event<PointerEvent>(btn, "pointerout", up);
    Interface.Event<PointerEvent>(btn, "pointercancel", up);

    const text: InterfaceText = new InterfaceText("text");
    text.position.set(offset, offset);
    text.text = "Hello World";
    text.fontSize = 64 * scale;
    ui.add(text);

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
