/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Mat4 {
    public readonly values: Float32Array | Float64Array;
    public readonly isFloat32: boolean;

    public constructor(float32: boolean = false) {
        this.values = float32 ? new Float32Array(16) : new Float64Array(16);
        this.isFloat32 = float32;
        this.reset();
    }

    public set(...floats: float[]): Mat4 {
        for (let i: int = 0; i < floats.length; i++) {
            this.values[i] = floats[i];
        }
        return this;
    }

    public reset(): Mat4 {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }

    public translate(x: Vec3 | float, y: float, z: float): Mat4 {
        if (x instanceof Vec3) {
            z = x.z;
            y = x.y;
            x = x.x;
        }
        this.multiply(
            Mat4.cache.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1)
        );
        return this;
    }

    public rotate(x: Vec3 | float, y: float, z: float): Mat4 {
        if (x instanceof Vec3) {
            z = x.z;
            y = x.y;
            x = x.x;
        }
        this.rotateX(x);
        this.rotateY(y);
        this.rotateZ(z);
        return this;
    }

    public rotateX(radian: float): Mat4 {
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        this.multiply(
            Mat4.cache.set(1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1)
        );
        return this;
    }

    public rotateY(radian: float): Mat4 {
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        this.multiply(
            Mat4.cache.set(c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1)
        );
        return this;
    }

    public rotateZ(radian: float): Mat4 {
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        this.multiply(
            Mat4.cache.set(c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
        );
        return this;
    }

    public scale(x: Vec3 | float, y: float, z: float): Mat4 {
        if (x instanceof Vec2) {
            z = x.z;
            y = x.y;
            x = x.x;
        }
        this.multiply(
            Mat4.cache.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1)
        );
        return this;
    }

    public multiply(mat: Mat4): Mat4 {
        const a00 = this.values[0];
        const a01 = this.values[1];
        const a02 = this.values[2];
        const a03 = this.values[3];
        const a10 = this.values[4];
        const a11 = this.values[5];
        const a12 = this.values[6];
        const a13 = this.values[7];
        const a20 = this.values[8];
        const a21 = this.values[9];
        const a22 = this.values[10];
        const a23 = this.values[11];
        const a30 = this.values[12];
        const a31 = this.values[13];
        const a32 = this.values[14];
        const a33 = this.values[15];

        const b00 = mat.values[0];
        const b01 = mat.values[1];
        const b02 = mat.values[2];
        const b03 = mat.values[3];
        const b10 = mat.values[4];
        const b11 = mat.values[5];
        const b12 = mat.values[6];
        const b13 = mat.values[7];
        const b20 = mat.values[8];
        const b21 = mat.values[9];
        const b22 = mat.values[10];
        const b23 = mat.values[11];
        const b30 = mat.values[12];
        const b31 = mat.values[13];
        const b32 = mat.values[14];
        const b33 = mat.values[15];

        this.values[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        this.values[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        this.values[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        this.values[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        this.values[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        this.values[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        this.values[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        this.values[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        this.values[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        this.values[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        this.values[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        this.values[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        this.values[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        this.values[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        this.values[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        this.values[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

        return this;
    }

    public copy(mat: Mat4): Mat4 {
        this.set(...mat.values);
        return this;
    }

    public clone(): Mat4 {
        return new Mat4(this.isFloat32).copy(this);
    }

    private static cache: Mat4 = new Mat4();

    public static orthographic(
        left: float,
        right: float,
        top: float,
        bottom: float,
        near: float,
        far: float,
        float32?: boolean
    ): Mat4 {
        return new Mat4(float32).set(
            2 / (right - left),
            0,
            0,
            0,
            0,
            2 / (top - bottom),
            0,
            0,
            0,
            0,
            2 / (near - far),
            0,
            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1
        );
    }
}
