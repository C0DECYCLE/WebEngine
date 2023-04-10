/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class Entity {
        public readonly id: uuid = UUIDv4();
        public readonly geometryName: string;

        public readonly position: Vec3 = new Vec3(0, 0, 0);
        public readonly rotation: Vec3 = new Vec3(0, 0, 0);

        private readonly world: Mat4 = new Mat4();

        private camera: Nullable<WebEngine.Camera> = null;
        private entityManager: Nullable<WebEngine.EntityManager> = null;
        private isAwake: boolean = false;
        private isRendering: boolean = false;

        private targetLod: int = -1;
        private frustumCull: boolean = true;
        private tempDistance: float;
        private tempCoverage: float;
        private tempLod: int;

        private isShadowCasting: boolean = false;
        private isShadowReceiving: boolean = false;
        private doShadowCulling: boolean = true;

        public get distance(): Nullable<float> {
            if (!this.isAwake) {
                return null;
            }
            return this.tempDistance;
        }

        public constructor(geometryName: string) {
            this.geometryName = geometryName;
        }

        public attach(renderer: WebEngine.Renderer): void {
            this.camera = renderer.getCamera();
            this.entityManager = renderer.getEntityManager();
            this.entityManager.attach(this);
        }

        public disableFrustumCulling(): void {
            this.frustumCull = false;
        }

        public staticLod(lod: int): void {
            if (lod === -1) {
                return warn(
                    `WebEngine.Entity: Static lod -1 not allowed. ${this.stringifyInfo()}`
                );
            }
            this.targetLod = lod;
        }

        public dynamicLod(): void {
            this.targetLod = -1;
        }

        public shadow(cast: boolean, receive: boolean): void {
            this.preventUnattached();
            if (this.isAwake) {
                if (cast && !this.isShadowCasting) {
                    this.entityManager!.shadow(this, true);
                } else if (!cast && this.isShadowCasting) {
                    this.entityManager!.shadow(this, false);
                }
            }
            this.isShadowCasting = cast;
            this.isShadowReceiving = receive;
        }

        public disableShadowCulling(): void {
            this.doShadowCulling = false;
        }

        public wakeUp(): void {
            this.preventUnattached();
            if (this.isAwake === true) {
                return warn(
                    `WebEngine.Entity: Entity already awake. ${this.stringifyInfo()}`
                );
            }
            this.entityManager!.wakeUp(this);
            this.isAwake = true;
            if (this.isShadowCasting) {
                this.entityManager!.shadow(this, true);
            }
        }

        public sleep(): void {
            this.preventUnattached();
            if (this.isAwake === false) {
                return warn(
                    `WebEngine.Entity: Entity already awake. ${this.stringifyInfo()}`
                );
            }
            this.entityManager!.sleep(this);
            this.isAwake = false;
            if (this.isShadowCasting) {
                this.entityManager!.shadow(this, false);
            }
        }

        public stringifyInfo(): string {
            return `(WebEngine.Geometry: ${this.geometryName}, Id: ${this.id})`;
        }

        /** @internal */
        public prepare(geometry: WebEngine.Geometry): boolean {
            this.computeTranslation();
            if (!this.computeInView(geometry)) {
                return (this.isRendering = false);
            }
            this.selectLod(geometry.data);
            if (this.tempLod === -1) {
                return (this.isRendering = false);
            }
            this.computeRotation(
                this.world.values[12],
                this.world.values[13],
                this.world.values[14]
            );
            this.passInstanceSubUniform(
                WebEngine.ShaderVariables.SHADOWRECEIVE,
                this.isShadowReceiving
            );
            return (this.isRendering = true);
        }

        /** @internal */
        public shadowify(
            geometry: WebEngine.Geometry,
            shadow: WebEngine.Shadow
        ): boolean {
            if (!this.isRendering) {
                return false;
            }
            if (this.shadowCull(geometry, shadow)) {
                return false;
            }
            geometry.storeInstance(
                this.world,
                geometry.hasLod(this.tempLod + 1)
                    ? this.tempLod + 1
                    : this.tempLod
            );
            return true;
        }

        /** @internal */
        public store(geometry: WebEngine.Geometry): void {
            if (!this.isRendering) {
                return;
            }
            geometry.storeInstance(this.world, this.tempLod);
        }

        private computeTranslation(): void {
            this.world.values[12] = this.position.x - this.camera!.position.x;
            this.world.values[13] = this.position.y - this.camera!.position.y;
            this.world.values[14] = this.position.z - this.camera!.position.z;
            this.tempDistance = this.computeDistance();
        }

        private computeDistance(): float {
            return Math.sqrt(
                this.world.values[12] * this.world.values[12] +
                    this.world.values[13] * this.world.values[13] +
                    this.world.values[14] * this.world.values[14]
            );
        }

        private computeInView(geometry: WebEngine.Geometry): boolean {
            if (!this.frustumCull) {
                return true;
            }
            return this.camera!.inFrustum(
                this.position,
                geometry.data.bounds.size * 1.5
            );
        }

        private selectLod(data: WebEngine.GeometryData): void {
            this.tempLod = this.targetLod;
            if (this.tempLod !== -1) {
                return;
            }
            this.tempCoverage = this.computeCoverage(
                data.bounds,
                this.tempDistance
            );
            this.tempLod = this.computeLod(data.lods, this.tempCoverage);
        }

        private computeCoverage(
            bounds: WebEngine.GeometryBounds,
            distance: float
        ): float {
            return bounds.size / (distance + bounds.size);
        }

        private computeLod(
            levels: WebEngine.GeometryDataLod[],
            coverage: float
        ): int {
            for (let i: int = 0; i < levels.length; i++) {
                if (this.inLevelCoverage(levels, i, coverage)) {
                    return i;
                }
            }
            return -1;
        }

        private inLevelCoverage(
            levels: WebEngine.GeometryDataLod[],
            i: int,
            coverage: float
        ): boolean {
            return (
                (i - 1 < 0
                    ? coverage <= Infinity
                    : coverage < levels[i - 1].minimum) &&
                coverage >= levels[i].minimum
            );
        }

        private computeRotation(x: float, y: float, z: float): void {
            if (!this.rotation.isDirty) {
                return;
            }
            this.world.reset();
            this.world.rotate(this.rotation);
            this.world.values[12] = x;
            this.world.values[13] = y;
            this.world.values[14] = z;
            this.rotation.isDirty = false;
        }

        private passInstanceSubUniform(
            row: WebEngine.ShaderVariables,
            value: float | boolean
        ): void {
            this.world.values[parseInt(row) * 4 + 3] = +value;
        }

        private shadowCull(
            geometry: WebEngine.Geometry,
            shadow: WebEngine.Shadow
        ): boolean {
            if (!this.doShadowCulling) {
                return false;
            }
            return (
                Vec3.Cache.copy(this.position)
                    .sub(shadow.position)
                    .lengthQuadratic() >
                (shadow.radius + geometry.data.bounds.size * 0.5) ** 2
            );
        }

        private preventUnattached(): void {
            if (!this.entityManager) {
                throw new Error(
                    `WebEngine.Entity: Entity not attached. ${this.stringifyInfo()}`
                );
            }
        }
    }
}
