/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Mat3 {
    public readonly values: Float32Array | Float64Array;
    public readonly isFloat32: boolean;

    public constructor(float32: boolean = false) {
        this.values = float32 ? new Float32Array(9) : new Float64Array(9);
        this.isFloat32 = float32;
        this.reset();
    }

    public set(...floats: float[]): Mat3 {
        for (let i: int = 0; i < floats.length; i++) {
            this.values[i] = floats[i];
        }
        return this;
    }

    public reset(): Mat3 {
        return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
    }

    public translate(x: Vec2 | float, y: float): Mat3 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        }
        this.multiply(Mat3.cache.set(1, 0, 0, 0, 1, 0, x, y, 1));
        return this;
    }

    public rotate(radian: float): Mat3 {
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        this.multiply(Mat3.cache.set(c, -s, 0, s, c, 0, 0, 0, 1));
        return this;
    }

    public scale(x: Vec2 | float, y: float): Mat3 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        }
        this.multiply(Mat3.cache.set(x, 0, 0, 0, y, 0, 0, 0, 1));
        return this;
    }

    public multiply(mat: Mat3): Mat3 {
        const a00 = this.values[0];
        const a01 = this.values[1];
        const a02 = this.values[2];
        const a10 = this.values[3];
        const a11 = this.values[4];
        const a12 = this.values[5];
        const a20 = this.values[6];
        const a21 = this.values[7];
        const a22 = this.values[8];

        const b00 = mat.values[0];
        const b01 = mat.values[1];
        const b02 = mat.values[2];
        const b10 = mat.values[3];
        const b11 = mat.values[4];
        const b12 = mat.values[5];
        const b20 = mat.values[6];
        const b21 = mat.values[7];
        const b22 = mat.values[8];

        this.values[0] = b00 * a00 + b01 * a10 + b02 * a20;
        this.values[1] = b00 * a01 + b01 * a11 + b02 * a21;
        this.values[2] = b00 * a02 + b01 * a12 + b02 * a22;
        this.values[3] = b10 * a00 + b11 * a10 + b12 * a20;
        this.values[4] = b10 * a01 + b11 * a11 + b12 * a21;
        this.values[5] = b10 * a02 + b11 * a12 + b12 * a22;
        this.values[6] = b20 * a00 + b21 * a10 + b22 * a20;
        this.values[7] = b20 * a01 + b21 * a11 + b22 * a21;
        this.values[8] = b20 * a02 + b21 * a12 + b22 * a22;

        return this;
    }

    public copy(mat: Mat3): Mat3 {
        this.set(...mat.values);
        return this;
    }

    public clone(): Mat3 {
        return new Mat3(this.isFloat32).copy(this);
    }

    private static cache: Mat3 = new Mat3();

    public static projection(w: float, h: float, float32?: boolean): Mat3 {
        return new Mat3(float32).set(2 / w, 0, 0, 0, -2 / h, 0, -1, 1, 1);
    }
}
