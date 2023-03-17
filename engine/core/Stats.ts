/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Stats {
    private then: float = -1;
    private renderThen: float = -1;
    private updateThen: float = -1;
    private drawThen: float = -1;

    private deltaMs: float = 0;
    private renderMs: float = 0;
    private updateMs: float = 0;
    private drawMs: float = 0;

    private activeEntities: int = 0;
    private totalEntities: int = 0;

    private drawCalls: int = 0;
    private activeVertecies: int = 0;
    private totalVertecies: int = 0;

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

    public begin(now: float): void {
        if (this.then === -1) {
            this.then = now;
        }
        this.renderThen = performance.now();
    }

    public beginUpdate(): void {
        this.updateThen = performance.now();
        this.activeEntities = 0;
        this.totalEntities = 0;
    }

    public incrementEntities(): void {
        this.activeEntities += 1;
    }

    public setTotalEntities(n: int): void {
        this.totalEntities = n;
    }

    public endUpdate(): void {
        this.updateMs = performance.now() - this.updateThen;
    }

    public beginDraw(): void {
        this.drawThen = performance.now();
        this.drawCalls = 0;
        this.activeVertecies = 0;
        this.totalVertecies = 0;
    }

    public incrementDrawCalls(vertecies: int): void {
        this.drawCalls += 1;
        this.activeVertecies += vertecies;
    }

    public incrementTotalVertecies(vertecies: int): void {
        this.totalVertecies += vertecies;
    }

    public endDraw(): void {
        this.drawMs = performance.now() - this.drawThen;
    }

    public end(now: float): void {
        this.deltaMs = now - this.then;
        this.then = now;
        this.renderMs = performance.now() - this.renderThen;

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
        return `
            frame rate: ${(1_000 / this.deltaMs).toFixed(1)} fps <br>
            frame delta: ${this.deltaMs.toFixed(2)} ms <br>
            <br>
            entities: ${this.activeEntities.dotit()} / ${this.totalEntities.dotit()}<br>
            <br>
            cpu frame rate: ${(1_000 / this.renderMs).toFixed(1)} fps <br>
            cpu frame time: ${this.renderMs.toFixed(2)} ms <br>
            |_ update: ${this.updateMs.toFixed(2)} ms <br>
            |_ draw: ${this.drawMs.toFixed(2)} ms <br>
            cpu inter time: ${(this.deltaMs - this.renderMs).toFixed(2)} ms <br>
            <br>
            gpu draw calls: ${this.drawCalls}<br>
            gpu vertecies: ${this.activeVertecies.dotit()} / ${this.totalVertecies.dotit()}<br>
            gpu faces: ${(this.activeVertecies / 3).dotit()} / ${(
            this.totalVertecies / 3
        ).dotit()}<br>
            <br>
            resolution: ${this.resolution[0]} px x ${this.resolution[1]} px<br>
            device pixel ratio: ${this.devicePixelRatio}<br>
        `;
    }
}
