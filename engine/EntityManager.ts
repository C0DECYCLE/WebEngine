/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class EntityManager {
    private readonly list: ObjectArray<Entity> = new ObjectArray<Entity>();
    private renderList: ObjectArray<Entity> = new ObjectArray<Entity>();

    private geometryManager: GeometryManager;

    public constructor(geometryManager: GeometryManager) {
        this.geometryManager = geometryManager;
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

    public prepare(): void {
        const geometryList: MapS<Geometry> = this.geometryManager.list;
        let i: int;
        let entity: Entity;
        for (i = 0; i < this.renderList.length; i++) {
            entity = this.renderList[i];
            entity.prepare(geometryList.get(entity.geometryName)!);
        }
    }

    public draw(): void {
        this.geometryManager.list.forEach((geometry: Geometry, _name: string) =>
            geometry.draw()
        );
    }
}
