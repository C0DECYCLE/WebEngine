/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Mat3 {
    public readonly values: Float32Array | Float64Array;
    public readonly isFloat64: boolean;

    public constructor(isFloat64: boolean = false) {
        this.values = isFloat64 ? new Float64Array(9) : new Float32Array(9);
        this.isFloat64 = isFloat64;
        this.reset();
    }

    public set(...floats: float[]): Mat3 {
        this.values[0] = floats[0];
        this.values[1] = floats[1];
        this.values[2] = floats[2];
        this.values[3] = floats[3];
        this.values[4] = floats[4];
        this.values[5] = floats[5];
        this.values[6] = floats[6];
        this.values[7] = floats[7];
        this.values[8] = floats[8];
        return this;
    }

    public reset(): Mat3 {
        // prettier-ignore
        return this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
    }

    public translate(x: Vec2 | float, y?: float): Mat3 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y === undefined) {
            y = x;
        }
        if (x === 0 && y === 0) {
            return this;
        }
        // prettier-ignore
        this.multiply(Mat3.Cache.set(
            1, 0, 0,
            0, 1, 0,
            x, y, 1
        ));
        return this;
    }

    public rotate(radian: float): Mat3 {
        if (radian === 0) {
            return this;
        }
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        // prettier-ignore
        this.multiply(Mat3.Cache.set(
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ));
        return this;
    }

    public scale(x: Vec2 | float, y?: float): Mat3 {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if (y === undefined) {
            y = x;
        }
        if (x === 0 && y === 0) {
            return this;
        }
        // prettier-ignore
        this.multiply(Mat3.Cache.set(
            x, 0, 0,
            0, y, 0,
            0, 0, 1
        ));
        return this;
    }

    public multiply(b: Mat3, a: Mat3 = this): Mat3 {
        const a00 = a.values[0];
        const a01 = a.values[1];
        const a02 = a.values[2];
        const a10 = a.values[3];
        const a11 = a.values[4];
        const a12 = a.values[5];
        const a20 = a.values[6];
        const a21 = a.values[7];
        const a22 = a.values[8];

        const b00 = b.values[0];
        const b01 = b.values[1];
        const b02 = b.values[2];
        const b10 = b.values[3];
        const b11 = b.values[4];
        const b12 = b.values[5];
        const b20 = b.values[6];
        const b21 = b.values[7];
        const b22 = b.values[8];

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

    public invert(): Mat3 {
        const n11: float = this.values[0];
        const n21: float = this.values[1];
        const n31: float = this.values[2];
        const n12: float = this.values[3];
        const n22: float = this.values[4];
        const n32: float = this.values[5];
        const n13: float = this.values[6];
        const n23: float = this.values[7];
        const n33: float = this.values[8];

        const t11: float = n33 * n22 - n32 * n23;
        const t12: float = n32 * n13 - n33 * n12;
        const t13: float = n23 * n12 - n22 * n13;

        const det: float = n11 * t11 + n21 * t12 + n31 * t13;

        if (det === 0) {
            // prettier-ignore
            return this.set(
                0, 0, 0,
                0, 0, 0,
                0, 0, 0
            );
        }

        const detInv: float = 1 / det;

        this.values[0] = t11 * detInv;
        this.values[1] = (n31 * n23 - n33 * n21) * detInv;
        this.values[2] = (n32 * n21 - n31 * n22) * detInv;
        this.values[3] = t12 * detInv;
        this.values[4] = (n33 * n11 - n31 * n13) * detInv;
        this.values[5] = (n31 * n12 - n32 * n11) * detInv;
        this.values[6] = t13 * detInv;
        this.values[7] = (n21 * n13 - n23 * n11) * detInv;
        this.values[8] = (n22 * n11 - n21 * n12) * detInv;

        return this;
    }

    public projection(width: float, height: float): Mat3 {
        // prettier-ignore
        return this.set(
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        );
    }

    public copy(mat: Mat3): Mat3 {
        this.set(...mat.values);
        return this;
    }

    public store(target: Float32Array | Float64Array, offset: int = 0): Mat3 {
        target[offset] = this.values[0];
        target[offset + 1] = this.values[1];
        target[offset + 2] = this.values[2];
        target[offset + 3] = this.values[3];
        target[offset + 4] = this.values[4];
        target[offset + 5] = this.values[5];
        target[offset + 6] = this.values[6];
        target[offset + 7] = this.values[7];
        target[offset + 8] = this.values[8];
        return this;
    }

    public clone(): Mat3 {
        return new Mat3(this.isFloat64).copy(this);
    }

    public static Cache: Mat3 = new Mat3();

    public static Projection(
        width: float,
        height: float,
        isFloat64?: boolean
    ): Mat3 {
        return new Mat3(isFloat64).projection(width, height);
    }
}
