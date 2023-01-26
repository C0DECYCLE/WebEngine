/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class Renderer {

    private canvas: HTMLCanvasElement;
    private adapter: GPUAdapter;
    private device: GPUDevice;

    public constructor() {

        this.createCanvas();
    }

    public async initialize() {

        const adapter: Nullable<GPUAdapter> = await navigator.gpu?.requestAdapter();

        if (!adapter) {

            console.error("Renderer: GPUAdapter request failed.");
            return;
        }

        this.adapter = adapter;
        this.device = await this.adapter.requestDevice();
    }

    private createCanvas() {

        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        document.body.appendChild(this.canvas);
    }
}