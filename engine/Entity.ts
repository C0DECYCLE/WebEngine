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

    private readonly world: Mat4 = new Mat4(true);

    private camera: Nullable<Camera> = null;
    private entityManager: Nullable<EntityManager> = null;
    private isAwake: boolean = false;

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
                `Renderer: Entity already awake. ${this.stringifyInfo()}`
            );
        }
        this.entityManager!.wakeUp(this);
        this.isAwake = true;
    }

    public sleep(): void {
        this.preventUnattached();
        if (this.isAwake === false) {
            return warn(
                `Renderer: Entity already awake. ${this.stringifyInfo()}`
            );
        }
        this.entityManager!.sleep(this);
        this.isAwake = false;
    }

    public prepare(geometry: Geometry): boolean {
        //cull frustum lod occlusion

        this.computeMatrix();
        geometry.storeInstance(this.world);

        return true; //drawn
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
