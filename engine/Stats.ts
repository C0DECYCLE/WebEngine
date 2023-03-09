/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Stats {
    private deltaMs: float = 0;
    private updateMs: float = 0;
    private drawMs: float = 0;

    private then: float = -1;
    private updateThen: float = -1;
    private drawThen: float = -1;

    private activeEntities: int = 0;
    private totalEntities: int = 0;
    private drawCalls: int = 0;

    private overlay: StatsOverlay;

    public get deltaTime(): float {
        return this.deltaMs;
    }

    public get updateTime(): float {
        return this.updateMs;
    }

    public get drawTime(): float {
        return this.drawMs;
    }

    public get fps(): float {
        return 1_000 / this.deltaMs;
    }

    public constructor() {
        this.createOverlay();
    }

    public begin(now: float): void {
        if (this.then === -1) {
            this.then = now;
        }
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
    }

    public incrementDrawCalls(): void {
        this.drawCalls += 1;
    }

    public endDraw(): void {
        this.drawMs = performance.now() - this.drawThen;
    }

    public end(now: float): void {
        this.deltaMs = now - this.then;
        this.then = now;
        this.overlay.update(this.stringify());
    }

    private createOverlay(): void {
        this.overlay = new StatsOverlay();
    }

    private stringify(): string {
        return `
            frame rate: ${this.fps.toFixed(1)} fps <br>
            frame delta: ${this.deltaTime.toFixed(2)} ms <br>
            <br>
            entities: ${this.activeEntities.dotit()} / ${this.totalEntities.dotit()}<br>
            draw calls: ${this.drawCalls}<br>
            <br>
            cpu update: ${this.updateTime.toFixed(2)} ms <br>
            cpu draw: ${this.drawTime.toFixed(2)} ms <br>
        `;
    }
}
