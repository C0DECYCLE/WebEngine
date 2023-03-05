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
    public readonly scalation: Vec3 = new Vec3(1, 1, 1);

    private readonly world: Mat4 = new Mat4(true);

    private entityManager: Nullable<EntityManager> = null;
    private isAwake: boolean = false;

    public constructor(geometryName: string) {
        this.geometryName = geometryName;
        this.computeMatrix();
    }

    public attach(renderer: Renderer): void {
        this.entityManager = renderer.getEntityManager();
        this.entityManager.attach(this);
    }

    public wakeUp(): void {
        this.preventUnattached();
        if (this.isAwake === true) {
            return console.warn(
                `Renderer: Entity already awake. ${this.stringifyInfo()}`
            );
        }
        this.entityManager!.wakeUp(this);
        this.isAwake = true;
    }

    public sleep(): void {
        this.preventUnattached();
        if (this.isAwake === false) {
            return console.warn(
                `Renderer: Entity already awake. ${this.stringifyInfo()}`
            );
        }
        this.entityManager!.sleep(this);
        this.isAwake = false;
    }

    public prepare(geometry: Geometry): void {
        //cull frustum lod occlusion
        this.computeMatrix();
        geometry.storeInstance(this.world);
    }

    private computeMatrix(): void {
        this.world.reset();
        this.world.translate(this.position); //floating origin
        this.world.rotate(this.rotation);
        this.world.scale(this.scalation);
    }

    public stringifyInfo(): string {
        return `(Geometry: ${this.geometryName}, Id: ${this.id})`;
    }

    private preventUnattached(): void {
        if (!this.entityManager) {
            throw new Error(
                `Renderer: Entity not attached. ${this.stringifyInfo()}`
            );
        }
    }
}
