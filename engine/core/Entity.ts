/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Entity {
    public readonly id: uuid = UUIDv4();
    public readonly geometryName: string;

    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly rotation: Vec3 = new Vec3(0, 0, 0);

    private readonly world: Mat4 = new Mat4();

    private camera: Nullable<Camera> = null;
    private entityManager: Nullable<EntityManager> = null;
    private isAwake: boolean = false;

    private targetLod: int = -1;
    private tempLod: int;
    private tempDistance: float;
    private tempCoverage: float;

    public constructor(geometryName: string) {
        this.geometryName = geometryName;
    }

    public attach(renderer: Renderer): void {
        this.camera = renderer.getCamera();
        this.entityManager = renderer.getEntityManager();
        this.entityManager.attach(this);
    }

    public wakeUp(): void {
        this.preventUnattached();
        if (this.isAwake === true) {
            return warn(
                `Entity: Entity already awake. ${this.stringifyInfo()}`
            );
        }
        this.entityManager!.wakeUp(this);
        this.isAwake = true;
    }

    public sleep(): void {
        this.preventUnattached();
        if (this.isAwake === false) {
            return warn(
                `Entity: Entity already awake. ${this.stringifyInfo()}`
            );
        }
        this.entityManager!.sleep(this);
        this.isAwake = false;
    }

    public staticLod(lod: int): void {
        this.targetLod = lod;
    }

    public dynamicLod(): void {
        this.targetLod = -1;
    }

    public prepare(geometry: Geometry): boolean {
        //cull: frustum occlusion lod

        this.computeMatrix();
        this.selectLod(geometry);
        geometry.storeInstance(this.world, this.tempLod);

        return true; //drawn
    }

    public stringifyInfo(): string {
        return `(Geometry: ${this.geometryName}, Id: ${this.id})`;
    }

    private computeMatrix(): void {
        if (this.rotation.isDirty) {
            this.world.reset();
            this.world.rotate(this.rotation);
            this.rotation.isDirty = false;
        }
        this.world.values[12] = this.position.x - this.camera!.position.x;
        this.world.values[13] = this.position.y - this.camera!.position.y;
        this.world.values[14] = this.position.z - this.camera!.position.z;
    }

    private selectLod(geometry: Geometry): void {
        this.tempLod = this.targetLod;
        if (this.targetLod === -1) {
            this.tempDistance = this.computeDistance();
            this.tempCoverage =
                geometry.data.bounds.size /
                (this.tempDistance + geometry.data.bounds.size);
            this.tempLod = this.computeLod(
                geometry.data.lods,
                this.tempCoverage
            );
        }
    }

    private computeDistance(): float {
        return Math.sqrt(
            this.world.values[12] * this.world.values[12] +
                this.world.values[13] * this.world.values[13] +
                this.world.values[14] * this.world.values[14]
        );
    }

    private computeLod(levels: GeometryDataLod[], coverage: float): int {
        for (let i: int = 0; i < levels.length; i++) {
            if (
                (i - 1 < 0
                    ? coverage <= Infinity
                    : coverage < levels[i - 1].minimum) &&
                coverage >= levels[i].minimum
            ) {
                return i;
            }
        }
        return -1;
    }

    private preventUnattached(): void {
        if (!this.entityManager) {
            throw new Error(
                `Renderer: Entity not attached. ${this.stringifyInfo()}`
            );
        }
    }
}
