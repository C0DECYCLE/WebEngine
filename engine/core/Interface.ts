/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Interface {
    public addEventListener: typeof addEventListener;

    private readonly root: HTMLDivElement;
    private readonly list: ObjectArray<InterfaceNode> =
        new ObjectArray<InterfaceNode>();

    public constructor() {
        this.root = this.createRoot();
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
    public update(): void {
        for (let i: int = 0; i < this.list.length; i++) {
            this.list[i].update();
        }
    }

    private createRoot(): HTMLDivElement {
        const root: HTMLDivElement = document.createElement("div");
        root.style.position = "absolute";
        root.style.top = "0px";
        root.style.left = "0px";
        root.style.width = "100%";
        root.style.height = "100%";
        root.style.backgroundColor = "transparent";
        document.body.append(root);
        const input: HTMLDivElement = document.createElement("div");
        input.style.position = "absolute";
        input.style.top = "0px";
        input.style.left = "0px";
        input.style.width = "100%";
        input.style.height = "100%";
        input.style.backgroundColor = "transparent";
        root.append(input);
        this.addEventListener = (
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ) => input.addEventListener.call(input, type, listener, options);
        return root;
    }
}
