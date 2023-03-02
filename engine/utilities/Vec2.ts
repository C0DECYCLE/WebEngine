/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Vec2 {
    public x: float;
    public y: float;

    public constructor(x: float = 0, y: float = 0) {
        this.set(x, y);
    }

    public set(x: float, y: float): Vec2 {
        this.x = x;
        this.y = y;
        return this;
    }

    public add(x: Vec2 | float, y?: float): Vec2 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y === undefined) {
            y = x;
        }
        if (x === 0 && y === 0) {
            return this;
        }
        this.x += x;
        this.y += y;
        return this;
    }

    public sub(x: Vec2 | float, y?: float): Vec2 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y === undefined) {
            y = x;
        }
        if (x === 0 && y === 0) {
            return this;
        }
        this.x -= x;
        this.y -= y;
        return this;
    }

    public scale(x: Vec2 | float, y?: float): Vec2 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y === undefined) {
            y = x;
        }
        if (x === 0 && y === 0) {
            return this;
        }
        this.x *= x;
        this.y *= y;
        return this;
    }

    public divide(x: Vec2 | float, y?: float): Vec2 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y === undefined) {
            y = x;
        }
        if (x === 0 && y === 0) {
            return this;
        }
        this.x /= x;
        this.y /= y;
        return this;
    }

    public length(): float {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(): Vec2 {
        this.divide(this.length());
        return this;
    }

    public applyMat(mat: Mat3): Vec2 {
        this.x =
            mat.values[0] * this.x + mat.values[3] * this.y + mat.values[6];
        this.y =
            mat.values[1] * this.x + mat.values[4] * this.y + mat.values[7];
        return this;
    }

    public copy(v: Vec2): Vec2 {
        this.set(v.x, v.y);
        return this;
    }

    public store(target: Float32Array | Float64Array, offset: int = 0): Vec2 {
        target[offset + 0] = this.x;
        target[offset + 1] = this.y;
        return this;
    }

    public clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    public static Dot(a: Vec2, b: Vec2): float {
        return a.x * b.x + a.y * b.y;
    }
}
