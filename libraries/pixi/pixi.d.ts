/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

declare namespace PIXI {
    class Renderer {
        constructor(options?: Object);
        view: HTMLCanvasElement;
        screen: PIXI.Rectangle;
        render(container: PIXI.Container): void;
    }

    class Container extends PIXI.DisplayObject {
        width: number;
        height: number;
        children: PIXI.DisplayObject[];
        on(event: string, fn: (event: PIXI.Event) => void): void;
        addChild<T extends PIXI.DisplayObject>(...children: T[]): void;
    }

    class Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    class Event {
        deltaY: number;
        client: PIXI.Point;
        movementX: number;
        movementY: number;
    }

    class Point {
        constructor(x?: number, y?: number);
        x: number;
        y: number;
        set(x?: number, y?: number): void;
        copy(point: PIXI.Point): void;
        clone(): PIXI.Point;
        equals(point: PIXI.Point): boolean;
    }

    class Texture {
        static async fromURL(string): Promise<PIXI.Texture>;
        width: number;
        height: number;
    }

    class DisplayObject {
        eventMode: string;
        hitArea: PIXI.Rectangle;
        position: PIXI.Point;
        anchor: PIXI.Point;
        scale: PIXI.Point;
        alpha: number;
    }

    class Sprite extends PIXI.Container {
        constructor(texture?: PIXI.Texture);
    }
}
