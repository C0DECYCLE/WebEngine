/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class EntityManager {
    private readonly list: ObjectArray<Entity> = new ObjectArray<Entity>();
    private readonly renderList: ObjectArray<Entity> =
        new ObjectArray<Entity>();
    private readonly shadowList: ObjectArray<Entity> =
        new ObjectArray<Entity>();

    private readonly geometryManager: GeometryManager;
    private readonly stats: Stats;

    public constructor(geometryManager: GeometryManager, stats: Stats) {
        this.geometryManager = geometryManager;
        this.stats = stats;
    }

    public getList(): ObjectArray<Entity> {
        return this.list;
    }

    /** @internal */
    public attach(entity: Entity): void {
        if (!this.geometryManager.list.has(entity.geometryName)) {
            throw new Error(
                `EntityManager: Geometry name unknown. ${entity.stringifyInfo()}`
            );
        }
        this.list.add(entity);
    }

    /** @internal */
    public wakeUp(entity: Entity): void {
        this.renderList.add(entity);
    }

    /** @internal */
    public sleep(entity: Entity): void {
        this.renderList.delete(entity);
    }

    /** @internal */
    public shadow(entity: Entity, value: boolean): void {
        if (value) {
            this.shadowList.add(entity);
            return;
        }
        this.shadowList.delete(entity);
    }

    /** @internal */
    public prepare(): void {
        for (let i: int = 0; i < this.renderList.length; i++) {
            if (
                this.renderList[i].prepare(
                    this.geometryManager.list.get(
                        this.renderList[i].geometryName
                    )!
                )
            ) {
                this.stats.add("activeEntities", 1);
            }
        }
        this.stats.set("totalEntities", this.list.length);
    }

    /** @internal */
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
                this.stats.add("shadowEntities", 1);
            }
        }
    }

    /** @internal */
    public store(): void {
        for (let i: int = 0; i < this.renderList.length; i++) {
            this.renderList[i].store(
                this.geometryManager.list.get(this.renderList[i].geometryName)!
            );
        }
    }

    /** @internal */
    public draw(isShadow: boolean, equipShader?: (name: string) => void): void {
        this.geometryManager.list.forEach(
            (geometry: Geometry, _name: string) => {
                if (!isShadow && equipShader) {
                    equipShader(geometry.data.shader);
                }
                geometry.draw(isShadow);
            }
        );
    }
}
