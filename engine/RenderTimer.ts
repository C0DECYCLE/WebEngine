/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class RenderTimer {
    private deltaMs: float = 0;
    private updateMs: float = 0;
    private drawMs: float = 0;

    private then: float = -1;
    private updateThen: float = -1;
    private drawThen: float = -1;

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
        return 1000 / this.deltaMs;
    }

    public begin(now: float): void {
        if (this.then === -1) {
            this.then = now;
        }
    }

    public beginUpdate(): void {
        this.updateThen = performance.now();
    }

    public endUpdate(): void {
        this.updateMs = performance.now() - this.updateThen;
    }

    public beginDraw(): void {
        this.drawThen = performance.now();
    }

    public endDraw(): void {
        this.drawMs = performance.now() - this.drawThen;
    }

    public end(now: float): void {
        this.deltaMs = now - this.then;
        this.then = now;
    }
}
