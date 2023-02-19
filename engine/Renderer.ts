/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class Renderer {
    private canvas: HTMLCanvasElement;
    private context: WebGL2RenderingContext;

    public constructor() {
        this.createCanvas();
        this.initialize();
    }

    private createCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        //this.canvas.style.imageRendering = "pixelated";

        document.body.appendChild(this.canvas);
    }

    private initialize() {
        const context: Nullable<WebGL2RenderingContext> =
            this.canvas.getContext("webgl2");

        if (!context) {
            console.error("Renderer: Get WebGL2RenderingContext failed.");
            return;
        }

        this.context = context;
        this.configureContext();
    }

    private configureContext() {}
}
