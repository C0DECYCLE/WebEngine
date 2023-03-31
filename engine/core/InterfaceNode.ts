/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

abstract class InterfaceNode {
    public readonly name: string;
    public readonly position: Vec2 = new Vec2(0, 0);

    public constructor(name: string) {
        this.name = name;
    }

    /** @internal */
    public abstract getElement(): HTMLElement;

    /** @internal */
    public abstract append(root: HTMLDivElement): void;

    /** @internal */
    public abstract update(): void;

    /** @internal */
    public stringify(): string {
        return `${this.name}`;
    }
}
