/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Interface {
    private readonly renderer: any;
    private readonly stage: any;

    public constructor() {
        this.renderer = this.createRenderer();
        this.stage = this.createStage();
    }

    public attach(node: any): void {
        this.stage.addChild(node);
    }

    public on(event: string, callback: any): void {
        this.stage.on(event, callback);
    }

    /** @internal */
    public render(): void {
        this.renderer.render(this.stage);
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

    private createStage(): any {
        const stage: any = new PIXI.Container();
        stage.eventMode = "static";
        stage.hitArea = this.renderer.screen;
        return stage;
    }
}
