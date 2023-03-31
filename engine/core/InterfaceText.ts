/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class InterfaceText extends InterfaceNode {
    public fontSize: float = 1.0;
    public text: string = "";
    public opacity: float = 1.0;

    private readonly p: HTMLParagraphElement;

    public constructor(name: string) {
        super(name);
        this.p = this.createParagraph();
    }

    /** @internal */
    public getElement(): HTMLElement {
        return this.p;
    }

    /** @internal */
    public append(root: HTMLDivElement): void {
        root.append(this.p);
    }

    /** @internal */
    public update(): void {
        this.p.innerHTML = this.text;
        this.p.style.top = `${this.position.y}px`;
        this.p.style.left = `${this.position.x}px`;
        this.p.style.fontSize = `${this.fontSize}px`;
        this.p.style.opacity = `${this.opacity}`;
    }

    private createParagraph(): HTMLParagraphElement {
        const p: HTMLParagraphElement = document.createElement("p");
        p.style.position = "absolute";
        return p;
    }
}
