/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Stats {
    private then: float = -1;
    private renderThen: float = -1;
    private updateThen: float = -1;
    private subUpdateThen: float = -1;
    private drawThen: float = -1;

    private deltaMs: float = 0;
    private renderMs: float = 0;
    private updateMs: float = 0;
    private subUpdateMs: float = 0;
    private drawMs: float = 0;

    private activeEntities: int = 0;
    private shadowEntities: int = 0;
    private totalEntities: int = 0;

    private drawCalls: int = 0;
    private shadowDrawCalls: int = 0;
    private activeVertecies: int = 0;
    private activeShadowVertecies: int = 0;
    private totalVertecies: int = 0;
    private totalShadowVertecies: int = 0;

    private resolution: [int, int] = [
        document.body.clientWidth,
        document.body.clientHeight,
    ];
    private devicePixelRatio: int = devicePixelRatio;

    private overlay: StatsOverlay;
    private overlayUpdateCounter: int = 0;

    public constructor() {
        this.createOverlay();
    }

    public eBegin(now: float): void {
        if (this.then === -1) {
            this.then = now;
        }
        this.renderThen = performance.now();
    }

    public eBeginUpdate(): void {
        this.updateThen = performance.now();
        this.activeEntities = 0;
        this.shadowEntities = 0;
        this.totalEntities = 0;
    }

    public eIncrementEntities(): void {
        this.activeEntities += 1;
    }

    public eIncrementShadowEntities(): void {
        this.shadowEntities += 1;
    }

    public eSetTotalEntities(n: int): void {
        this.totalEntities = n;
    }

    public eEndUpdate(): void {
        this.updateMs = performance.now() - this.updateThen;
    }

    public eBeginSubUpdate(): void {
        this.subUpdateThen = performance.now();
    }

    public eEndSubUpdate(): void {
        this.subUpdateMs = performance.now() - this.subUpdateThen;
    }

    public eBeginDraw(): void {
        this.drawThen = performance.now();
        this.drawCalls = 0;
        this.shadowDrawCalls = 0;
        this.activeVertecies = 0;
        this.activeShadowVertecies = 0;
        this.totalVertecies = 0;
        this.totalShadowVertecies = 0;
    }

    public eIncrementDrawCalls(vertecies: int, isShadow: boolean): void {
        if (isShadow) {
            return this.incrementShadowDrawCalls(vertecies);
        }
        this.drawCalls += 1;
        this.activeVertecies += vertecies;
    }

    public eIncrementTotalVertecies(vertecies: int, isShadow: boolean): void {
        if (isShadow) {
            return this.incrementTotalShadowVertecies(vertecies);
        }
        this.totalVertecies += vertecies;
    }

    public eEndDraw(): void {
        this.drawMs = performance.now() - this.drawThen;
    }

    public eEnd(now: float): void {
        this.deltaMs = now - this.then;
        this.then = now;
        this.renderMs = performance.now() - this.renderThen;

        this.updateOverlay();
    }

    private createOverlay(): void {
        this.overlay = new StatsOverlay();
    }

    private incrementShadowDrawCalls(vertecies: int): void {
        this.shadowDrawCalls += 1;
        this.activeShadowVertecies += vertecies;
    }

    private incrementTotalShadowVertecies(vertecies: int): void {
        this.totalShadowVertecies += vertecies;
    }

    private updateOverlay(): void {
        if (this.overlayUpdateCounter === 0) {
            this.overlay.eUpdate(this.stringify());
            this.overlayUpdateCounter++;
        } else if (this.overlayUpdateCounter === 3) {
            this.overlayUpdateCounter = 0;
        } else {
            this.overlayUpdateCounter++;
        }
    }

    private stringify(): string {
        return `
            <b>frame rate: ${(1_000 / this.deltaMs).toFixed(1)} fps</b><br>
            frame delta: ${this.deltaMs.toFixed(2)} ms<br>
            <br>
            <b>entities: ${this.activeEntities.dotit()} / ${this.totalEntities.dotit()}</b><br>
            |_ shadow: ${this.shadowEntities.dotit()} / ${this.totalEntities.dotit()}<br>
            <br>
            ${this.stringifyCpu()}
            <br>
            ${this.stringifyGpu()}
            <br>
            resolution: ${this.resolution[0]} px x ${this.resolution[1]} px<br>
            device pixel ratio: ${this.devicePixelRatio}<br>
        `;
    }

    private stringifyCpu(): string {
        return `
            <b>cpu frame time: ${this.renderMs.toFixed(2)} ms</b><br>
            |_ update: ${(this.updateMs + this.subUpdateMs).toFixed(2)} ms<br>
            |_ draw: ${(this.drawMs - this.subUpdateMs).toFixed(2)} ms<br>
            <br>
            cpu frame rate: ${(1_000 / this.renderMs).toFixed(1)} fps<br>
            cpu inter time: ${(this.deltaMs - this.renderMs).toFixed(2)} ms<br>
        `;
    }

    private stringifyGpu(): string {
        return `
            <b>gpu draw calls: ${this.drawCalls + this.shadowDrawCalls}</b><br>
            |_ main: ${this.drawCalls}<br>
            |_ shadow: ${this.shadowDrawCalls}<br>
            <br>
            <b>gpu vertecies: ${(
                this.activeVertecies + this.activeShadowVertecies
            ).dotit()} / ${(
            this.totalVertecies + this.totalShadowVertecies
        ).dotit()}</b><br>
            |_ main: ${this.activeVertecies.dotit()} / ${this.totalVertecies.dotit()}<br>
            |_ shadow: ${this.activeShadowVertecies.dotit()} / ${this.totalShadowVertecies.dotit()}<br>
            <br>
            <b>gpu faces: ${(
                this.activeVertecies / 3 +
                this.activeShadowVertecies / 3
            ).dotit()} / ${(
            this.totalVertecies / 3 +
            this.totalShadowVertecies / 3
        ).dotit()}</b><br>
            |_ main: ${(this.activeVertecies / 3).dotit()} / ${(
            this.totalVertecies / 3
        ).dotit()}<br>
            |_ shadow: ${(this.activeShadowVertecies / 3).dotit()} / ${(
            this.totalShadowVertecies / 3
        ).dotit()}<br>
        `;
    }
}
