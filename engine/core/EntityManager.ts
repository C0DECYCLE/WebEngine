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

    public eAttach(entity: Entity): void {
        if (!this.geometryManager.list.has(entity.geometryName)) {
            throw new Error(
                `EntityManager: Geometry name unknown. ${entity.stringifyInfo()}`
            );
        }
        this.list.add(entity);
    }

    public eWakeUp(entity: Entity): void {
        this.renderList.add(entity);
    }

    public eSleep(entity: Entity): void {
        this.renderList.delete(entity);
    }

    public eShadow(entity: Entity, value: boolean): void {
        if (value) {
            this.shadowList.add(entity);
            return;
        }
        this.shadowList.delete(entity);
    }

    public ePrepare(): void {
        for (let i: int = 0; i < this.renderList.length; i++) {
            if (
                this.renderList[i].ePrepare(
                    this.geometryManager.list.get(
                        this.renderList[i].geometryName
                    )!
                )
            ) {
                this.stats.eIncrementEntities();
            }
        }
        this.stats.eSetTotalEntities(this.list.length);
    }

    public eShadowify(shadow: Shadow): void {
        for (let i: int = 0; i < this.shadowList.length; i++) {
            if (
                this.shadowList[i].eShadowify(
                    this.geometryManager.list.get(
                        this.shadowList[i].geometryName
                    )!,
                    shadow
                )
            ) {
                this.stats.eIncrementShadowEntities();
            }
        }
    }

    public eStore(): void {
        for (let i: int = 0; i < this.renderList.length; i++) {
            this.renderList[i].eStore(
                this.geometryManager.list.get(this.renderList[i].geometryName)!
            );
        }
    }

    public eDraw(isShadow: boolean): void {
        this.geometryManager.list.forEach((geometry: Geometry, _name: string) =>
            geometry.eDraw(isShadow)
        );
    }
}
