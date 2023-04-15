/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

namespace WebEngine {
    export class Interface {
        private readonly renderer: PIXI.Renderer;
        private readonly empty: PIXI.Container;
        private active: Nullable<PIXI.Container> = null;

        public constructor() {
            this.renderer = this.createRenderer();
            this.empty = new PIXI.Container();
        }

        public getRenderer(): PIXI.Renderer {
            return this.renderer;
        }

        public activate(stage: Nullable<PIXI.Container>): void {
            this.active = stage;
        }

        /** @internal */
        public render(): void {
            if (!this.active) {
                this.renderer.render(this.empty);
                return;
            }
            this.renderer.render(this.active);
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
