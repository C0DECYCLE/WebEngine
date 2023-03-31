/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Interface {
    private readonly root: HTMLDivElement;
    private readonly input: HTMLDivElement;
    private readonly list: ObjectArray<InterfaceNode> =
        new ObjectArray<InterfaceNode>();

    public constructor() {
        this.root = this.createBlank();
        this.input = this.createBlank();
        this.root.append(this.input);
        document.body.append(this.root);
    }

    public add(node: InterfaceNode): void {
        if (this.list.has(node)) {
            throw new Error(
                `Interface: Node already added. ${node.stringify()}`
            );
        }
        this.list.add(node);
        node.append(this.root);
    }

    /** @internal */
    public getInput(): HTMLDivElement {
        return this.input;
    }

    /** @internal */
    public update(): void {
        for (let i: int = 0; i < this.list.length; i++) {
            this.list[i].update();
        }
    }

    private createBlank(): HTMLDivElement {
        const root: HTMLDivElement = document.createElement("div");
        root.style.position = "absolute";
        root.style.top = "0px";
        root.style.left = "0px";
        root.style.width = "100%";
        root.style.height = "100%";
        root.style.backgroundColor = "transparent";
        return root;
    }

    public static GetImageSize(
        source: string,
        callback: (result: Vec2) => void
    ): void {
        let image: Nullable<HTMLImageElement> = new Image();
        image.onload = (): void => {
            callback(new Vec2(image!.naturalWidth, image!.naturalHeight));
            image = null;
        };
        image.src = source;
    }

    public static Event<T extends Event>(
        element: Interface | InterfaceNode | HTMLElement,
        name: string,
        callback: (event: T) => void
    ): void {
        if (element instanceof Interface) {
            element = element.getInput();
        } else if (element instanceof InterfaceNode) {
            element = element.getElement();
        }
        element.addEventListener(name, (event: Event) => {
            event.stopPropagation();
            event.preventDefault();
            callback(event as T);
        });
    }
}
