/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class Interface {
        private readonly renderer: PIXI.Renderer;
        private readonly main: PIXI.Container;

        public constructor() {
            this.renderer = this.createRenderer();
            this.main = new PIXI.Container();
        }

        public getRenderer(): PIXI.Renderer {
            return this.renderer;
        }

        public register(stage: PIXI.Container): void {
            this.main.addChild(stage);
        }

        /** @internal */
        public render(): void {
            this.renderer.render(this.main);
        }

        private createRenderer(): PIXI.Renderer {
            const renderer: PIXI.Renderer = new PIXI.Renderer({
                width: WebEngine.Renderer.Width,
                height: WebEngine.Renderer.Height,
                resolution: devicePixelRatio,
                antialias: true,
                autoDensity: false,
                backgroundColor: "#000000",
                backgroundAlpha: 0.0,
                hello: false,
                clearBeforeRender: true,
                powerPreference: "high-performance",
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
            });
            renderer.view.style.position = "absolute";
            renderer.view.style.top = "0px";
            renderer.view.style.left = "0px";
            renderer.view.style.width = "100%";
            renderer.view.style.height = "100%";
            document.body.appendChild(renderer.view);
            return renderer;
        }
    }
}
