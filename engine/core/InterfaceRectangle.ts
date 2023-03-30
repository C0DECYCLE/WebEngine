/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class InterfaceRectangle extends InterfaceNode {
    public readonly size: Vec2 = new Vec2(0, 0);
    public color: string = "#000000";
    public opacity: float = 1.0;

    private readonly div: HTMLDivElement;

    public constructor(name: string) {
        super(name);
        this.div = this.createDiv();
    }

    /** @internal */
    public append(root: HTMLDivElement): void {
        root.append(this.div);
    }

    /** @internal */
    public update(): void {
        this.div.style.top = `${this.position.y}px`;
        this.div.style.left = `${this.position.x}px`;
        this.div.style.width = `${this.size.x}px`;
        this.div.style.height = `${this.size.y}px`;
        this.div.style.backgroundColor = this.color;
        this.div.style.opacity = `${this.opacity}`;
    }

    private createDiv(): HTMLDivElement {
        const div: HTMLDivElement = document.createElement("div");
        div.style.position = "absolute";
        return div;
    }
}
