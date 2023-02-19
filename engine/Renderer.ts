/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class Renderer {

    private canvas: HTMLCanvasElement;
    private adapter: GPUAdapter;
    private device: GPUDevice;
    private context: GPUCanvasContext;

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

        const context: Nullable<GPUCanvasContext> = this.canvas.getContext("webgpu");

        if (!context) {
            console.error("Renderer: Get GPUCanvasContext failed.");
            return;
        }

        this.context = context;
        this.configureContext();
    }


    private createCanvas() {

        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        //this.canvas.style.imageRendering = "pixelated";

        document.body.appendChild(this.canvas);
    }

    private configureContext() {

        const devicePixelRatio: int = window.devicePixelRatio || 1;
        const presentationSize: [int, int] = [
            this.canvas.clientWidth * devicePixelRatio,
            this.canvas.clientHeight * devicePixelRatio
        ];
        const presentationFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            size: presentationSize,
            format: presentationFormat,
            alphaMode: 'opaque'
        });
    }
}