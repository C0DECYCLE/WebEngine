/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

class Renderer {

    public readonly canvas: HTMLCanvasElement;

    public constructor() {

        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        document.body.appendChild(this.canvas);
    }
}