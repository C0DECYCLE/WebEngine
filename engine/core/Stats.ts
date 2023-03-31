/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Stats {
    private readonly list: MapS<any> = new MapS<any>([
        ["then", -1],
        ["renderThen", -1],
        ["updateThen", -1],
        ["subUpdateThen", -1],
        ["drawThen", -1],

        ["deltaMs", 0],
        ["renderMs", 0],
        ["updateMs", 0],
        ["subUpdateMs", 0],
        ["drawMs", 0],

        ["activeEntities", 0],
        ["shadowEntities", 0],
        ["totalEntities", 0],

        ["drawCalls", 0],
        ["shadowDrawCalls", 0],

        ["activeVertecies", 0],
        ["activeShadowVertecies", 0],
        ["totalVertecies", 0],
        ["totalShadowVertecies", 0],

        ["resolution", [Renderer.Width, Renderer.Height]],
        ["devicePixelRatio", devicePixelRatio],
    ]);

    private overlay: StatsOverlay;
    private overlayUpdateCounter: int = 0;

    public constructor() {
        this.createOverlay();
    }

    public show(): void {
        this.overlay.show();
    }

    /** @internal */
    public get(key: string): any {
        return this.list.get(key);
    }

    /** @internal */
    public set(key: string, value: any): void {
        this.list.set(key, value);
    }

    /** @internal */
    public add(key: string, value: any): void {
        this.list.set(key, this.get(key) + value);
    }

    /** @internal */
    public begin(now: float): void {
        if (this.get("then") === -1) {
            this.set("then", now);
        }
        this.set("renderThen", performance.now());
    }

    /** @internal */
    public beginUpdate(): void {
        this.set("updateThen", performance.now());

        this.set("activeEntities", 0);
        this.set("shadowEntities", 0);
        this.set("totalEntities", 0);
    }

    /** @internal */
    public endUpdate(): void {
        this.set("updateMs", performance.now() - this.get("updateThen"));
    }

    /** @internal */
    public beginSubUpdate(): void {
        this.set("subUpdateThen", performance.now());
    }

    /** @internal */
    public endSubUpdate(): void {
        this.set("subUpdateMs", performance.now() - this.get("subUpdateThen"));
    }

    /** @internal */
    public beginDraw(): void {
        this.set("drawThen", performance.now());

        this.set("drawCalls", 0);
        this.set("shadowDrawCalls", 0);

        this.set("activeVertecies", 0);
        this.set("activeShadowVertecies", 0);

        this.set("totalVertecies", 0);
        this.set("totalShadowVertecies", 0);
    }

    /** @internal */
    public endDraw(): void {
        this.set("drawMs", performance.now() - this.get("drawThen"));
    }

    /** @internal */
    public end(now: float): void {
        this.set("deltaMs", now - this.get("then"));
        this.set("renderMs", performance.now() - this.get("renderThen"));

        this.set("then", now);

        this.updateOverlay();
    }

    private createOverlay(): void {
        this.overlay = new StatsOverlay();
    }

    private updateOverlay(): void {
        if (this.overlayUpdateCounter === 0) {
            this.overlay.update(this.stringify());
            this.overlayUpdateCounter++;
        } else if (this.overlayUpdateCounter === 3) {
            this.overlayUpdateCounter = 0;
        } else {
            this.overlayUpdateCounter++;
        }
    }

    private stringify(): string {
        // prettier-ignore
        return `
            <b>frame rate: ${(1_000 / this.get("deltaMs")).toFixed(1)} fps</b><br>
            frame delta: ${this.get("deltaMs").toFixed(2)} ms<br>
            <br>
            <b>entities: ${this.get("activeEntities").dotit()} / ${this.get("totalEntities").dotit()}</b><br>
            |_ shadow: ${this.get("shadowEntities").dotit()} / ${this.get("totalEntities").dotit()}<br>
            <br>
            ${this.stringifyCpu()}
            <br>
            ${this.stringifyGpu()}
            <br>
            resolution: ${this.get("resolution")[0]} px x ${this.get("resolution")[1]} px<br>
            device pixel ratio: ${this.get("devicePixelRatio")}<br>
        `;
    }

    private stringifyCpu(): string {
        // prettier-ignore
        return `
            <b>cpu frame time: ${this.get("renderMs").toFixed(2)} ms</b><br>
            |_ update: ${(this.get("updateMs") + this.get("subUpdateMs")).toFixed(2)} ms<br>
            |_ draw: ${(this.get("drawMs") - this.get("subUpdateMs")).toFixed(2)} ms<br>
            <br>
            cpu frame rate: ${(1_000 / this.get("renderMs")).toFixed(1)} fps<br>
            cpu inter time: ${(this.get("deltaMs") - this.get("renderMs")).toFixed(2)} ms<br>
        `;
    }

    private stringifyGpu(): string {
        // prettier-ignore
        return `
            <b>gpu draw calls: ${this.get("drawCalls") + this.get("shadowDrawCalls")}</b><br>
            |_ main: ${this.get("drawCalls")}<br>
            |_ shadow: ${this.get("shadowDrawCalls")}<br>
            <br>
            <b>gpu vertecies: ${(this.get("activeVertecies") + this.get("activeShadowVertecies")).dotit()} / ${(this.get("totalVertecies") + this.get("totalShadowVertecies")).dotit()}</b><br>
            |_ main: ${this.get("activeVertecies").dotit()} / ${this.get("totalVertecies").dotit()}<br>
            |_ shadow: ${this.get("activeShadowVertecies").dotit()} / ${this.get("totalShadowVertecies").dotit()}<br>
            <br>
            <b>gpu faces: ${(this.get("activeVertecies") / 3 + this.get("activeShadowVertecies") / 3).dotit()} / ${(this.get("totalVertecies") / 3 + this.get("totalShadowVertecies") / 3).dotit()}</b><br>
            |_ main: ${(this.get("activeVertecies") / 3).dotit()} / ${(this.get("totalVertecies") / 3).dotit()}<br>
            |_ shadow: ${(this.get("activeShadowVertecies") / 3).dotit()} / ${(this.get("totalShadowVertecies") / 3).dotit()}<br>
        `;
    }
}
