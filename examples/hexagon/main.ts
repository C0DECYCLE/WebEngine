/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

var renderer: WebEngine.Renderer;

window.addEventListener("compile", async (_event: Event): Promise<void> => {
    renderer = new WebEngine.Renderer(new Vec3(0.9, 0.9, 0.9));
    await renderer.initialize(
        [
            "models/tree.obj",
            "models/house.obj",
            "models/field.obj",
            "models/water.obj",
            "models/sand.obj",
            "models/buildable.obj",
        ],
        ["shaders/water", "shaders/hint"]
    );
    //renderer.getStats().show();
    renderer.getCanvas().style.filter = "hue-rotate(350deg) saturate(120%)";

    const ui: WebEngine.Interface = renderer.getInterface();
    ui.getRenderer().view.style.filter = "hue-rotate(340deg) saturate(120%)";

    const stage: PIXI.Container = new PIXI.Container();
    stage.visible = true;
    stage.eventMode = "static";
    stage.hitArea = ui.getRenderer().screen;

    const cameraTilt: float = 37.5 * toRadian;
    const cameraDirection: Vec3 = new Vec3(0.0, 0.0, -1.0)
        .applyMat(new Mat4().rotateX(cameraTilt))
        .scale(2.0);

    const camera: WebEngine.Camera = renderer.getCamera();
    camera.target.set(-0.1, 0, -0.25).scale(80);

    const zoomSpeed: float = 0.025;
    let zoom: float = 40;

    stage.on("wheel", (event: PIXI.Event) => {
        zoom += event.deltaY * zoomSpeed;
        zoom = zoom.clamp(20, 60);
        camera.position.copy(cameraDirection).scale(zoom).add(camera.target);
    });

    camera.position.copy(cameraDirection).scale(zoom).add(camera.target);

    const dragSpeed: float = 0.15;
    let isDowning: boolean = false;
    let isPicking: boolean = false;
    const downCoord: Vec2 = new Vec2();
    const upCoord: Vec2 = new Vec2();

    const dragStart = (event: PIXI.Event) => {
        isDowning = true;
        isPicking = true;
        downCoord.set(event.client.x, event.client.y);
    };

    const dragMove = (event: PIXI.Event) => {
        if (!isDowning) {
            return;
        }
        if (isPicking) {
            if (
                upCoord
                    .set(event.client.x, event.client.y)
                    .sub(downCoord)
                    .length() > 10.0
            ) {
                isPicking = false;
            }
        } else {
            camera.target.add(
                event.movementX * dragSpeed * zoom * 0.015,
                0.0,
                event.movementY * dragSpeed * zoom * 0.015
            );
            camera.target.x = camera.target.x.clamp(-80, 140);
            camera.target.z = camera.target.z.clamp(-140, 100);
            camera.position
                .copy(cameraDirection)
                .scale(zoom)
                .add(camera.target);
        }
    };

    const buildables: ObjectArray<WebEngine.Entity> =
        new ObjectArray<WebEngine.Entity>();
    let isBuilding: boolean = false;

    const mouseRay = (mouseCoord: PIXI.Point) => {
        if (!isBuilding) {
            return;
        }

        for (let i: int = 0; i < buildables.length; i++) {
            const clipPotential: Vec3 = buildables[i].position
                .clone()
                .sub(camera.position)
                //@ts-ignore
                .applyMat(camera.viewProjection);
            const screenPotential: Vec2 = new Vec2(
                (clipPotential.x * 0.5 + 0.5) * WebEngine.Renderer.Width,
                (-clipPotential.y * 0.5 + 0.5) * WebEngine.Renderer.Height
            );
            const distance: float = screenPotential
                .clone()
                .sub(mouseCoord.x, mouseCoord.y)
                .length();
            const inverseSize: float = 1.0 - (clipPotential.z * 0.5 + 0.5);
            if (distance < 200.0 * inverseSize) {
                const house: WebEngine.Entity = new WebEngine.Entity("house");
                house.position.copy(buildables[i].position);
                if (Math.random() > 0.5) house.rotation.y = 180 * toRadian;
                house.attach(renderer);
                house.shadow(true, true);
                house.wakeUp();

                buildables[i].sleep();
                buildables.delete(buildables[i]);
            }
        }

        /*
        const ray: Vec3 = new Vec3(
            2.0 * (mouseCoord.x / Renderer.Width) - 1.0,
            2.0 * (mouseCoord.y / Renderer.Height) - 1.0,
            -1.0
        )
            .normalize()
            .applyMat(camera.projection.clone().invert())
            .applyMat(new Mat4().rotateX(cameraTilt));

        const up: Vec3 = new Vec3(0.0, 1.0, 0.0);
        const t: float = -Vec3.Dot(camera.position, up) / Vec3.Dot(ray, up);

        const hit: Vec3 = ray.clone().scale(t).add(camera.position);

        for (let i: int = 0; i < buildables.length; i++) {
            const distance: float = buildables[i].position
                .clone()
                .sub(hit)
                .length();
            if (distance < 10) {
                const house: Entity = new Entity("house");
                house.position.copy(buildables[i].position);
                if (Math.random() > 0.5) house.rotation.y = 180 * toRadian;
                house.attach(renderer);
                house.shadow(true, true);
                house.wakeUp();

                buildables[i].sleep();
                buildables.delete(buildables[i]);
            }
        }
        */
    };

    const dragStop = (event: PIXI.Event) => {
        isDowning = false;
        if (isPicking) {
            mouseRay(event.client);
        }
        isPicking = false;
    };

    stage.on("pointerdown", dragStart);
    stage.on("pointermove", dragMove);
    stage.on("pointerup", dragStop);
    stage.on("pointerupoutside", dragStop);
    stage.on("pointerout", dragStop);

    const light: WebEngine.Light = renderer.getLight();
    light.ambient.set(0.15, 0.05, 0.2);
    light.direction.set(1.5, -0.75, 0.25).normalize();
    light.color.set(1.0, 1.0, 1.0);

    const shadow: WebEngine.Shadow = light.setShadow(1024);
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
            const field: WebEngine.Entity = new WebEngine.Entity(key);
            field.position.set(-x * 14.9, 0, -z * 17.4);
            field.position.z -= x % 2 == 0 ? 0 : 8.65;
            field.position.x += map[0].length * 0.5 * 14.9;
            field.position.z += map.length * 0.5 * 17.4;
            if (Math.random() > 0.5) field.rotation.y = 180 * toRadian;
            field.attach(renderer);
            field.shadow(true, true);
            field.wakeUp();

            if (Math.random() > 0.6) {
                const tree: WebEngine.Entity = new WebEngine.Entity("tree");
                tree.position.copy(field.position);
                if (Math.random() > 0.5) tree.rotation.y = 180 * toRadian;
                tree.attach(renderer);
                tree.shadow(true, true);
                tree.wakeUp();
                continue;
            }

            if (Math.random() > 0.0) {
                const buildable: WebEngine.Entity = new WebEngine.Entity(
                    "buildable"
                );
                buildable.position.copy(field.position);
                buildable.attach(renderer);
                buildable.shadow(false, false);
                buildable.staticLod(0);
                //buildable.wakeUp();
                buildables.add(buildable);
                continue;
            }

            const house: WebEngine.Entity = new WebEngine.Entity("house");
            house.position.copy(field.position);
            if (Math.random() > 0.5) house.rotation.y = 180 * toRadian;
            house.attach(renderer);
            house.shadow(true, true);
            house.wakeUp();
        }
    }

    for (let z: int = 0; z < 8; z++) {
        for (let x: int = 0; x < 10; x++) {
            const water: WebEngine.Entity = new WebEngine.Entity("water");
            water.position.set(-x * 60, -2.0, -z * 60);
            water.position.x += 5 * 60;
            water.position.z += 4 * 60;
            if (x % 2 == 0) water.rotation.y = 180 * toRadian;
            water.attach(renderer);
            water.staticLod(0);
            water.shadow(false, true);
            water.wakeUp();

            const sand: WebEngine.Entity = new WebEngine.Entity("sand");
            sand.position.set(-x * 60, 0.0, -z * 60);
            sand.position.x += 5 * 60;
            sand.position.z += 4 * 60;
            sand.attach(renderer);
            sand.shadow(false, false);
            sand.wakeUp();
        }
    }

    const offset: float = 20;
    const scale: float = WebEngine.Renderer.Height / 900;

    const texture1: PIXI.Texture = await PIXI.Texture.fromURL(
        "images/test1.png"
    );
    const texture2: PIXI.Texture = await PIXI.Texture.fromURL(
        "images/test2.png"
    );
    const texture3: PIXI.Texture = await PIXI.Texture.fromURL(
        "images/test3.png"
    );
    const button: PIXI.Texture = await PIXI.Texture.fromURL(
        "images/button.png"
    );

    const img1: PIXI.Sprite = new PIXI.Sprite(texture1);
    img1.position.set(
        WebEngine.Renderer.Width - offset,
        WebEngine.Renderer.Height - offset
    );
    img1.anchor.set(1.0, 1.0);
    img1.scale.set(scale, scale);
    stage.addChild(img1);

    const img2: PIXI.Sprite = new PIXI.Sprite(texture2);
    img2.position.set(WebEngine.Renderer.Width - offset, offset);
    img2.anchor.set(1.0, 0.0);
    img2.scale.set(scale, scale);
    stage.addChild(img2);

    const img3: PIXI.Sprite = new PIXI.Sprite(texture3);
    img3.position.set(offset, offset);
    img3.scale.set(scale, scale);
    stage.addChild(img3);

    const btn: PIXI.Sprite = new PIXI.Sprite(button);
    btn.position.set(
        img1.position.x - img1.width * 0.5,
        img1.position.y - img1.height + 100 * scale
    );
    btn.anchor.set(0.5, 0.0);
    btn.scale.set(scale, scale);
    btn.eventMode = "static";
    const shrink = (_event: PIXI.Event) =>
        btn.scale.set(scale * 0.8, scale * 0.8);
    const expand = (_event: PIXI.Event) => btn.scale.set(scale, scale);
    const up = (_event: PIXI.Event) => {
        expand(_event);
        if (!isBuilding) {
            isBuilding = true;
            for (let i: int = 0; i < buildables.length; i++) {
                buildables[i].wakeUp();
            }
        } else {
            isBuilding = false;
            for (let i: int = 0; i < buildables.length; i++) {
                buildables[i].sleep();
            }
        }
    };
    btn.on("pointerdown", shrink);
    btn.on("pointerup", up);
    btn.on("pointerout", expand);
    btn.on("pointercancel", expand);
    stage.addChild(btn);

    ui.register(stage);

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
