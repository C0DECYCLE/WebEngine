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
        addChild<T extends PIXI.DisplayObject>(...children: T[]): void;
        removeChild<T extends PIXI.DisplayObject>(...children: T[]): void;
        destroy(options?: Object | boolean): void;
    }

    class Rectangle {
        constructor(x?: number, y?: number, width?: number, height?: height);
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
        timeStamp: number;
        pageX: number;
        pageY: number;
    }

    class Point {
        constructor(x?: number, y?: number);
        x: number;
        y: number;
        set(x?: number, y?: number): void;
        copyFrom(point: PIXI.Point): void;
        copyTo(point: PIXI.Point): void;
        clone(): PIXI.Point;
        equals(point: PIXI.Point): boolean;
    }

    class Texture {
        static async fromURL(string): Promise<PIXI.Texture>;
        width: number;
        height: number;
        textureCacheIds: string[];
    }

    class DisplayObject {
        visible: boolean;
        eventMode: string;
        hitArea: PIXI.Rectangle;
        parent: PIXI.Container;
        interactiveChildren: boolean;
        on(event: string, fn: (event: PIXI.Event) => void): void;
        position: PIXI.Point;
        pivot: PIXI.Point;
        scale: PIXI.Point;
        alpha: number;
        rotation: number;
        mask: PIXI.Container;
    }

    class Sprite extends PIXI.Container {
        constructor(texture?: PIXI.Texture);
        anchor: PIXI.Point;
        tint: number;
        texture?: PIXI.Texture;
    }

    class TextStyle {
        constructor(style: Object);
        fill: string;
        fontFamily: string;
        fontSize: number;
    }

    class Text extends PIXI.Sprite {
        constructor(text?: string, style?: PIXI.TextStyle);
        style: PIXI.TextStyle;
        text: string;
    }

    class Graphics extends PIXI.Container {
        beginFill(color: string, alpha: number): void;
        endFill(): void;
        drawRect(x: number, y: number, width: number, height: number): void;
        drawPolygon(path: number[]): void;
        lineStyle(width: number, color: string): void;
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
    }
}
