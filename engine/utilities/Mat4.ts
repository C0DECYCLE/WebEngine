/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

class Mat4 {
    public readonly values: Float32Array | Float64Array;
    public readonly isFloat32: boolean;

    public constructor(isFloat32: boolean = false) {
        this.values = isFloat32 ? new Float32Array(16) : new Float64Array(16);
        this.isFloat32 = isFloat32;
        this.reset();
    }

    public set(...floats: float[]): Mat4 {
        let i: int = 0;
        for (i = 0; i < floats.length; i++) {
            this.values[i] = floats[i];
        }
        return this;
    }

    public reset(): Mat4 {
        // prettier-ignore
        return this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    public lookAt(position: Vec3, target: Vec3, up: Vec3): Mat4 {
        const zAxis: Vec3 = position.clone().sub(target).normalize();
        const xAxis: Vec3 = Vec3.Cross(up, zAxis).normalize();
        const yAxis: Vec3 = Vec3.Cross(zAxis, xAxis).normalize();
        // prettier-ignore
        return this.set(
            xAxis.x, xAxis.y, xAxis.z, 0,
            yAxis.x, yAxis.y, yAxis.z, 0,
            zAxis.x, zAxis.y, zAxis.z, 0,
            position.x, position.y, position.z, 1
        );
    }

    public translate(x: Vec3 | float, y?: float, z?: float): Mat4 {
        if (x instanceof Vec3) {
            z = x.z;
            y = x.y;
            x = x.x;
        } else if (y === undefined || z === undefined) {
            z = x;
            y = x;
        }
        if (x === 0 && y === 0 && z === 0) {
            return this;
        }
        // prettier-ignore
        this.multiply(Mat4.Cache.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ));
        return this;
    }

    public rotate(x: Vec3 | float, y?: float, z?: float): Mat4 {
        if (x instanceof Vec3) {
            z = x.z;
            y = x.y;
            x = x.x;
        } else if (y === undefined || z === undefined) {
            z = x;
            y = x;
        }
        this.rotateX(x);
        this.rotateY(y);
        this.rotateZ(z);
        return this;
    }

    public rotateX(radian: float): Mat4 {
        if (radian === 0) {
            return this;
        }
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        // prettier-ignore
        this.multiply(Mat4.Cache.set(
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ));
        return this;
    }

    public rotateY(radian: float): Mat4 {
        if (radian === 0) {
            return this;
        }
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        // prettier-ignore
        this.multiply(Mat4.Cache.set(
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ));
        return this;
    }

    public rotateZ(radian: float): Mat4 {
        if (radian === 0) {
            return this;
        }
        const c = Math.cos(radian);
        const s = Math.sin(radian);
        // prettier-ignore
        this.multiply(Mat4.Cache.set(
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ));
        return this;
    }

    public scale(x: Vec3 | float, y?: float, z?: float): Mat4 {
        if (x instanceof Vec3) {
            z = x.z;
            y = x.y;
            x = x.x;
        } else if (y === undefined || z === undefined) {
            y = x;
            z = x;
        }
        if (x === 0 && y === 0 && z === 0) {
            return this;
        }
        // prettier-ignore
        this.multiply(Mat4.Cache.set(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ));
        return this;
    }

    public multiply(b: Mat4, a: Mat4 = this): Mat4 {
        const a00 = a.values[0];
        const a01 = a.values[1];
        const a02 = a.values[2];
        const a03 = a.values[3];
        const a10 = a.values[4];
        const a11 = a.values[5];
        const a12 = a.values[6];
        const a13 = a.values[7];
        const a20 = a.values[8];
        const a21 = a.values[9];
        const a22 = a.values[10];
        const a23 = a.values[11];
        const a30 = a.values[12];
        const a31 = a.values[13];
        const a32 = a.values[14];
        const a33 = a.values[15];

        const b00 = b.values[0];
        const b01 = b.values[1];
        const b02 = b.values[2];
        const b03 = b.values[3];
        const b10 = b.values[4];
        const b11 = b.values[5];
        const b12 = b.values[6];
        const b13 = b.values[7];
        const b20 = b.values[8];
        const b21 = b.values[9];
        const b22 = b.values[10];
        const b23 = b.values[11];
        const b30 = b.values[12];
        const b31 = b.values[13];
        const b32 = b.values[14];
        const b33 = b.values[15];

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

    public invert(): Mat4 {
        const n11: float = this.values[0];
        const n21: float = this.values[1];
        const n31: float = this.values[2];
        const n41: float = this.values[3];
        const n12: float = this.values[4];
        const n22: float = this.values[5];
        const n32: float = this.values[6];
        const n42: float = this.values[7];
        const n13: float = this.values[8];
        const n23: float = this.values[9];
        const n33: float = this.values[10];
        const n43: float = this.values[11];
        const n14: float = this.values[12];
        const n24: float = this.values[13];
        const n34: float = this.values[14];
        const n44: float = this.values[15];

        const t11: float =
            n23 * n34 * n42 -
            n24 * n33 * n42 +
            n24 * n32 * n43 -
            n22 * n34 * n43 -
            n23 * n32 * n44 +
            n22 * n33 * n44;
        const t12: float =
            n14 * n33 * n42 -
            n13 * n34 * n42 -
            n14 * n32 * n43 +
            n12 * n34 * n43 +
            n13 * n32 * n44 -
            n12 * n33 * n44;
        const t13: float =
            n13 * n24 * n42 -
            n14 * n23 * n42 +
            n14 * n22 * n43 -
            n12 * n24 * n43 -
            n13 * n22 * n44 +
            n12 * n23 * n44;
        const t14: float =
            n14 * n23 * n32 -
            n13 * n24 * n32 -
            n14 * n22 * n33 +
            n12 * n24 * n33 +
            n13 * n22 * n34 -
            n12 * n23 * n34;

        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) {
            // prettier-ignore
            return this.set(
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            );
        }

        const detInv: float = 1 / det;

        this.values[0] = t11 * detInv;
        this.values[1] =
            (n24 * n33 * n41 -
                n23 * n34 * n41 -
                n24 * n31 * n43 +
                n21 * n34 * n43 +
                n23 * n31 * n44 -
                n21 * n33 * n44) *
            detInv;
        this.values[2] =
            (n22 * n34 * n41 -
                n24 * n32 * n41 +
                n24 * n31 * n42 -
                n21 * n34 * n42 -
                n22 * n31 * n44 +
                n21 * n32 * n44) *
            detInv;
        this.values[3] =
            (n23 * n32 * n41 -
                n22 * n33 * n41 -
                n23 * n31 * n42 +
                n21 * n33 * n42 +
                n22 * n31 * n43 -
                n21 * n32 * n43) *
            detInv;

        this.values[4] = t12 * detInv;
        this.values[5] =
            (n13 * n34 * n41 -
                n14 * n33 * n41 +
                n14 * n31 * n43 -
                n11 * n34 * n43 -
                n13 * n31 * n44 +
                n11 * n33 * n44) *
            detInv;
        this.values[6] =
            (n14 * n32 * n41 -
                n12 * n34 * n41 -
                n14 * n31 * n42 +
                n11 * n34 * n42 +
                n12 * n31 * n44 -
                n11 * n32 * n44) *
            detInv;
        this.values[7] =
            (n12 * n33 * n41 -
                n13 * n32 * n41 +
                n13 * n31 * n42 -
                n11 * n33 * n42 -
                n12 * n31 * n43 +
                n11 * n32 * n43) *
            detInv;

        this.values[8] = t13 * detInv;
        this.values[9] =
            (n14 * n23 * n41 -
                n13 * n24 * n41 -
                n14 * n21 * n43 +
                n11 * n24 * n43 +
                n13 * n21 * n44 -
                n11 * n23 * n44) *
            detInv;
        this.values[10] =
            (n12 * n24 * n41 -
                n14 * n22 * n41 +
                n14 * n21 * n42 -
                n11 * n24 * n42 -
                n12 * n21 * n44 +
                n11 * n22 * n44) *
            detInv;
        this.values[11] =
            (n13 * n22 * n41 -
                n12 * n23 * n41 -
                n13 * n21 * n42 +
                n11 * n23 * n42 +
                n12 * n21 * n43 -
                n11 * n22 * n43) *
            detInv;

        this.values[12] = t14 * detInv;
        this.values[13] =
            (n13 * n24 * n31 -
                n14 * n23 * n31 +
                n14 * n21 * n33 -
                n11 * n24 * n33 -
                n13 * n21 * n34 +
                n11 * n23 * n34) *
            detInv;
        this.values[14] =
            (n14 * n22 * n31 -
                n12 * n24 * n31 -
                n14 * n21 * n32 +
                n11 * n24 * n32 +
                n12 * n21 * n34 -
                n11 * n22 * n34) *
            detInv;
        this.values[15] =
            (n12 * n23 * n31 -
                n13 * n22 * n31 +
                n13 * n21 * n32 -
                n11 * n23 * n32 -
                n12 * n21 * n33 +
                n11 * n22 * n33) *
            detInv;

        return this;
    }

    public copy(mat: Mat4): Mat4 {
        this.set(...mat.values);
        return this;
    }

    public store(target: Float32Array | Float64Array, offset: int = 0): Mat4 {
        let i: int = 0;
        for (i = 0; i < this.values.length; i++) {
            target[offset + i] = this.values[i];
        }
        return this;
    }

    public clone(): Mat4 {
        return new Mat4(this.isFloat32).copy(this);
    }

    private static Cache: Mat4 = new Mat4();

    public static Orthographic(
        left: float,
        right: float,
        top: float,
        bottom: float,
        near: float,
        far: float,
        isFloat32?: boolean
    ): Mat4 {
        // prettier-ignore
        return new Mat4(isFloat32).set(
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,
            (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1
        );
    }

    public static Perspective(
        fov: float,
        aspect: float,
        near: float,
        far: float,
        isFloat32?: boolean
    ): Mat4 {
        const f: float = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv: float = 1.0 / (near - far);
        // prettier-ignore
        return new Mat4(isFloat32).set(
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0,
        );
    }
}
