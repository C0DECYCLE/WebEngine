/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class EntityManager {
        private readonly list: ObjectArray<WebEngine.Entity> =
            new ObjectArray<WebEngine.Entity>();
        private readonly renderList: ObjectArray<WebEngine.Entity> =
            new ObjectArray<WebEngine.Entity>();
        private readonly shadowList: ObjectArray<WebEngine.Entity> =
            new ObjectArray<WebEngine.Entity>();

        private readonly geometryManager: WebEngine.GeometryManager;
        private readonly stats: WebEngine.Stats;

        public constructor(
            geometryManager: WebEngine.GeometryManager,
            stats: WebEngine.Stats
        ) {
            this.geometryManager = geometryManager;
            this.stats = stats;
        }

        public getList(): ObjectArray<WebEngine.Entity> {
            return this.list;
        }

        /** @internal */
        public attach(entity: WebEngine.Entity): void {
            if (!this.geometryManager.list.has(entity.geometryName)) {
                throw new Error(
                    `WebEngine.EntityManager: Geometry name unknown. ${entity.stringifyInfo()}`
                );
            }
            this.list.add(entity);
        }

        /** @internal */
        public detach(entity: WebEngine.Entity): void {
            this.list.delete(entity);
        }

        /** @internal */
        public wakeUp(entity: WebEngine.Entity): void {
            this.renderList.add(entity);
        }

        /** @internal */
        public sleep(entity: WebEngine.Entity): void {
            this.renderList.delete(entity);
        }

        /** @internal */
        public shadow(entity: WebEngine.Entity, value: boolean): void {
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
        public shadowify(shadow: WebEngine.Shadow): void {
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
                    this.geometryManager.list.get(
                        this.renderList[i].geometryName
                    )!
                );
            }
        }

        /** @internal */
        public draw(
            isShadow: boolean,
            equipShader?: (name: string) => void
        ): void {
            this.geometryManager.list.forEach(
                (geometry: WebEngine.Geometry, _name: string) => {
                    if (!isShadow && equipShader) {
                        equipShader(geometry.data.shader);
                    }
                    geometry.draw(isShadow);
                }
            );
        }
    }
}
