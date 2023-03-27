/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class EntityManager {
    private readonly list: ObjectArray<Entity> = new ObjectArray<Entity>();
    private renderList: ObjectArray<Entity> = new ObjectArray<Entity>();
    private shadowList: ObjectArray<Entity> = new ObjectArray<Entity>();

    private readonly geometryManager: GeometryManager;
    private readonly stats: Stats;

    public constructor(geometryManager: GeometryManager, stats: Stats) {
        this.geometryManager = geometryManager;
        this.stats = stats;
    }

    public getList(): ObjectArray<Entity> {
        return this.list;
    }

    /**
     * @internal
     */
    public attach(entity: Entity): void {
        if (!this.geometryManager.list.has(entity.geometryName)) {
            throw new Error(
                `EntityManager: Geometry name unknown. ${entity.stringifyInfo()}`
            );
        }
        this.list.add(entity);
    }

    /**
     * @internal
     */
    public wakeUp(entity: Entity): void {
        this.renderList.add(entity);
    }

    /**
     * @internal
     */
    public sleep(entity: Entity): void {
        this.renderList.delete(entity);
    }

    /**
     * @internal
     */
    public shadow(entity: Entity, value: boolean): void {
        if (value) {
            this.shadowList.add(entity);
            return;
        }
        this.shadowList.delete(entity);
    }

    /**
     * @internal
     */
    public prepare(): void {
        for (let i: int = 0; i < this.renderList.length; i++) {
            if (
                this.renderList[i].prepare(
                    this.geometryManager.list.get(
                        this.renderList[i].geometryName
                    )!
                )
            ) {
                this.stats.incrementEntities();
            }
        }
        this.stats.setTotalEntities(this.list.length);
    }

    /**
     * @internal
     */
    public shadowify(shadow: Shadow): void {
        for (let i: int = 0; i < this.shadowList.length; i++) {
            if (
                this.shadowList[i].shadowify(
                    this.geometryManager.list.get(
                        this.shadowList[i].geometryName
                    )!,
                    shadow
                )
            ) {
                this.stats.incrementShadowEntities();
            }
        }
    }

    /**
     * @internal
     */
    public store(): void {
        for (let i: int = 0; i < this.renderList.length; i++) {
            this.renderList[i].store(
                this.geometryManager.list.get(this.renderList[i].geometryName)!
            );
        }
    }

    /**
     * @internal
     */
    public draw(isShadow: boolean): void {
        this.geometryManager.list.forEach((geometry: Geometry, _name: string) =>
            geometry.draw(isShadow)
        );
    }
}
