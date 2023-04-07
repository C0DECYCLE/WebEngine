/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Interface {
    private readonly renderer: any;
    private active: Nullable<any> = null;

    public constructor() {
        this.renderer = this.createRenderer();
    }

    public getRenderer(): any {
        return this.renderer;
    }

    public activate(stage: Nullable<any>): void {
        this.active = stage;
    }

    /** @internal */
    public render(): void {
        if (!this.active) {
            return;
        }
        this.renderer.render(this.active);
    }

    private createRenderer(): any {
        const renderer: any = new PIXI.Renderer({
            width: Renderer.Width,
            height: Renderer.Height,
            resolution: devicePixelRatio,
            antialias: true,
            autoDensity: false,
            backgroundColor: "#000000",
            backgroundAlpha: 0.0,
            hello: false,
            clearBeforeRender: true,
            powerPreference: "high-performance",
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
        });
        renderer.view.style.position = "absolute";
        renderer.view.style.top = "0px";
        renderer.view.style.left = "0px";
        renderer.view.style.width = "100%";
        renderer.view.style.height = "100%";
        renderer.view.style.filter = "hue-rotate(340deg) saturate(120%)";
        document.body.appendChild(renderer.view);
        return renderer;
    }
}
