/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class InterfaceImage extends InterfaceNode {
    public readonly size: Vec2 = new Vec2(0, 0);
    public source: string = "";
    public opacity: float = 1.0;

    private readonly image: HTMLImageElement;

    public constructor(name: string) {
        super(name);
        this.image = this.createImage();
    }

    /** @internal */
    public getElement(): HTMLElement {
        return this.image;
    }

    /** @internal */
    public append(root: HTMLDivElement): void {
        root.append(this.image);
    }

    /** @internal */
    public update(): void {
        this.image.src = this.source;
        this.image.style.top = `${this.position.y}px`;
        this.image.style.left = `${this.position.x}px`;
        this.image.style.width = `${this.size.x}px`;
        this.image.style.height = `${this.size.y}px`;
        this.image.style.opacity = `${this.opacity}`;
    }

    private createImage(): HTMLImageElement {
        const image: HTMLImageElement = document.createElement("img");
        image.style.position = "absolute";
        return image;
    }
}
