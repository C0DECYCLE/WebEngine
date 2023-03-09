/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class EntityManager {
    private readonly list: ObjectArray<Entity> = new ObjectArray<Entity>();
    private renderList: ObjectArray<Entity> = new ObjectArray<Entity>();

    private readonly geometryManager: GeometryManager;
    private readonly stats: Stats;

    public constructor(geometryManager: GeometryManager, stats: Stats) {
        this.geometryManager = geometryManager;
        this.stats = stats;
    }

    public getList(): ObjectArray<Entity> {
        return this.list;
    }

    public attach(entity: Entity): void {
        if (!this.geometryManager.list.has(entity.geometryName)) {
            throw new Error(
                `Renderer: Geometry name unknown. ${entity.stringifyInfo()}`
            );
        }
        this.list.add(entity);
    }

    public wakeUp(entity: Entity): void {
        this.renderList.add(entity);
    }

    public sleep(entity: Entity): void {
        this.renderList.delete(entity);
    }

    public prepare(positionOffset?: Vec3): void {
        const geometryList: MapS<Geometry> = this.geometryManager.list;
        let i: int;
        let entity: Entity;
        for (i = 0; i < this.renderList.length; i++) {
            entity = this.renderList[i];
            if (
                entity.prepare(
                    geometryList.get(entity.geometryName)!,
                    positionOffset
                )
            ) {
                this.stats.incrementEntities();
            }
        }
        this.stats.setTotalEntities(this.list.length);
    }

    public draw(): void {
        this.geometryManager.list.forEach((geometry: Geometry, _name: string) =>
            geometry.draw()
        );
    }
}
