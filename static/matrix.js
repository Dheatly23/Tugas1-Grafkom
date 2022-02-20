class Vector3 {
    #data;

    constructor() {
        if (arguments.length === 3) {
            this.#data = new Float32Array(arguments);
        } else if (arguments.length === 1) {
            let data = arguments[0];
            if (data instanceof Vector3) {
                this.#data = new Float32Array(data.#data);
            } else if (data !== undefined) {
                this.#data = new Float32Array(3);
                this.#data.set(data);
            } else {
                this.#data = new Float32Array(3);
            }
        } else if (arguments.length === 0) {
            this.#data = new Float32Array(3);
        } else {
            throw new Error("Unexpected argument length");
        }
    }

    get [0]() {
        return this.#data[0];
    }

    set [0](v) {
        this.#data[0] = v;
    }

    get [1]() {
        return this.#data[1];
    }

    set [1](v) {
        this.#data[1] = v;
    }

    get [2]() {
        return this.#data[2];
    }

    set [2](v) {
        this.#data[2] = v;
    }

    get x() {
        return this.#data[0];
    }

    set x(v) {
        this.#data[0] = v;
    }

    get y() {
        return this.#data[1];
    }

    set y(v) {
        this.#data[1] = v;
    }

    get z() {
        return this.#data[2];
    }

    set z(v) {
        this.#data[2] = v;
    }

    get lengthSquared() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return x * x + y * y + z * z;
    }

    get length() {
        return Math.sqrt(this.lengthSquared);
    }

    static zero() {
        return new this();
    }

    static one() {
        return new this(1, 1, 1);
    }

    static x() {
        return new this(1, 0, 0);
    }

    static y() {
        return new this(0, 1, 0);
    }

    static z() {
        return new this(0, 0, 1);
    }

    normalize() {
        const l = 1.0 / this.length;
        this.#data[0] *= l;
        this.#data[1] *= l;
        this.#data[2] *= l;
        return this;
    }

    negative() {
        this.#data[0] = -this.#data[0];
        this.#data[1] = -this.#data[1];
        this.#data[2] = -this.#data[2];
        return this;
    }

    add(other) {
        if (!(other instanceof Vector3)) {
            throw new Error("Cannot add with non-vector");
        }
        this.#data[0] += other.#data[0];
        this.#data[1] += other.#data[1];
        this.#data[2] += other.#data[2];
        return this;
    }

    sub(other) {
        if (!(other instanceof Vector3)) {
            throw new Error("Cannot subtract with non-vector");
        }
        this.#data[0] -= other.#data[0];
        this.#data[1] -= other.#data[1];
        this.#data[2] -= other.#data[2];
        return this;
    }

    rsub(other) {
        if (!(other instanceof Vector3)) {
            throw new Error("Cannot reverse subtract with non-vector");
        }
        this.#data[0] = other.#data[0] - this.#data[0];
        this.#data[1] = other.#data[1] - this.#data[1];
        this.#data[2] = other.#data[2] - this.#data[2];
        return this;
    }

    dot(other) {
        if (!(other instanceof Vector3)) {
            throw new Error("Cannot dot product with non-vector");
        }
        return this.#data[0] * other.#data[0] + this.#data[1] * other.#data[1] + this.#data[2] * other.#data[2];
    }

    cross(other) {
        if (!(other instanceof Vector3)) {
            throw new Error("Cannot cross product with non-vector");
        }
        const x = this.#data[1] * other.#data[2] - this.#data[2] * other.#data[1];
        const y = this.#data[2] * other.#data[0] - this.#data[0] * other.#data[2];
        const z = this.#data[0] * other.#data[1] - this.#data[1] * other.#data[0];
        this.#data[0] = x;
        this.#data[1] = y;
        this.#data[2] = z;
        return this;
    }

    transform(mat) {
        if (!(other instanceof Matrix4)) {
            throw new Error("Cannot cross product with non-matrix");
        }
        const o = other.array();
        const x = this.#data[0] * o[0] + this.#data[1] * o[4] + this.#data[2] * o[8] + o[12];
        const y = this.#data[0] * o[1] + this.#data[1] * o[5] + this.#data[2] * o[9] + o[13];
        const z = this.#data[0] * o[2] + this.#data[1] * o[6] + this.#data[2] * o[10] + o[14];
        this.#data[0] = x;
        this.#data[1] = y;
        this.#data[2] = z;
        return this;
    }
}

class Matrix4 {
    #data;

    constructor(data) {
        if (data instanceof Matrix4) {
            this.#data = new Float32Array(data.#data);
        } else if (data !== undefined) {
            this.#data = new Float32Array(16);
            this.#data.set(data);
        } else {
            this.#data = new Float32Array(16);
        }
    }

    getEntry(i, j) {
        if ((i < 0) || (i > 3))
            return undefined;
        if ((j < 0) || (j > 3))
            return undefined;
        return this.#data[i + j * 4];
    }

    setEntry(i, j, v) {
        if ((i < 0) || (i > 3))
            return undefined;
        if ((j < 0) || (j > 3))
            return undefined;
        this.#data[i + j * 4] = v;
        return this;
    }

    get array() {
        return this.#data.slice();
    }

    set array(v) {
        if (v.length !== 16)
            throw new Error("length mismatch");
        this.#data.set(v);
    }

    static identity() {
        return new this([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }

    static orthographic(left, right, bottom, top, near, far) {
        return new this([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,

            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1,
        ]);
    }

    static perspective(fov, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        var rangeInv = 1.0 / (near - far);

        return new this([
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near + far) * rangeInv, -1,
          0, 0, near * far * rangeInv * 2, 0,
        ]);
    }

    multiply(other) {
        if (!(other instanceof Matrix4)) {
            throw new Error("Cannot multiply with non-matrix");
        }
        let a = this.#data;
        let b = other.#data;
        this.#data.set([
            a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
            a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
            a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
            a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
            a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
            a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
            a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
            a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
            a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
            a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
            a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
            a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
            a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
            a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
            a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
            a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
        ]);
        return this;
    }

    transpose() {
        let m = this.#data;
        function swap(i, j) {
            let t = m[i];
            m[i] = m[j];
            m[j] = t;
        }
        swap(1, 4);
        swap(2, 8);
        swap(3, 12);
        swap(6, 9);
        swap(7, 13);
        swap(11, 14);
        return this;
    }

    translate(dx, dy, dz) {
        dx *= this.#data[3];
        dy *= this.#data[7];
        dz *= this.#data[11];
        this.#data[0] += dx;
        this.#data[4] += dx;
        this.#data[8] += dx;
        this.#data[12] += dx;
        this.#data[1] += dy;
        this.#data[5] += dy;
        this.#data[9] += dy;
        this.#data[13] += dy;
        this.#data[2] += dz;
        this.#data[6] += dz;
        this.#data[10] += dz;
        this.#data[14] += dz;
        return this;
    }

    scale(sx, sy, sz) {
        this.#data[0] *= sx;
        this.#data[4] *= sx;
        this.#data[8] *= sx;
        this.#data[12] *= sx;
        this.#data[1] *= sy;
        this.#data[5] *= sy;
        this.#data[9] *= sy;
        this.#data[13] *= sy;
        this.#data[2] *= sz;
        this.#data[6] *= sz;
        this.#data[10] *= sz;
        this.#data[14] *= sz;
        return this;
    }
}

class Quat {
    constructor() {
        if (arguments.length === 4) {
            this.r = arguments[0];
            this.x = arguments[1];
            this.y = arguments[2];
            this.z = arguments[3];
        } else if (arguments.length === 1) {
            let data = arguments[0];
            if (data instanceof Quat) {
                this.r = data.r;
                this.x = data.x;
                this.y = data.y;
                this.z = data.z;
            } else if (data !== undefined) {
                this.r = data[0] || 0;
                this.x = data[1] || 0;
                this.y = data[2] || 0;
                this.z = data[3] || 0;
            }
        } else if (arguments.length === 0) {
            this.r = 1;
            this.x = 0;
            this.y = 0;
            this.z = 0;
        } else {
            throw new Error("Unexpected argument length");
        }
    }

    static identity() {
        return new this();
    }

    static fromTaitBryanAngles(yaw, pitch, roll) {
        yaw *= 0.5;
        pitch *= 0.5;
        roll *= 0.5;
        let sy = Math.sin(yaw);
        let cy = Math.cos(yaw);
        let sp = Math.sin(pitch);
        let cp = Math.cos(pitch);
        let sr = Math.sin(roll);
        let cr = Math.cos(roll);
        return new this(
            cy * cp * cr + sy * sp * sr,
            sy * cp * cr - cy * sp * sr,
            cy * sp * cr + sy * cp * sr,
            cy * cp * sr - sy * sp * cr,
        );
    }

    static fromAxisAngle(x, y, z, theta) {
        theta *= 0.5;
        let c = Math.cos(theta);
        let s = Math.sin(theta);
        return new this(c, x * s, y * s, z * s);
    }

    static rotateX(theta) {
        return this.fromAxisAngle(1, 0, 0, theta);
    }

    static rotateY(theta) {
        return this.fromAxisAngle(0, 1, 0, theta);
    }

    static rotateZ(theta) {
        return this.fromAxisAngle(0, 0, 1, theta);
    }

    get i() {
        return this.x;
    }

    set i(v) {
        this.x = v;
    }

    get j() {
        return this.y;
    }

    set j(v) {
        this.y = v;
    }

    get k() {
        return this.z;
    }

    set k(v) {
        this.z = v;
    }

    get a() {
        return this.r;
    }

    set a(v) {
        this.r = v;
    }

    get b() {
        return this.x;
    }

    set b(v) {
        this.x = v;
    }

    get c() {
        return this.y;
    }

    set c(v) {
        this.y = v;
    }

    get d() {
        return this.z;
    }

    set d(v) {
        this.z = v;
    }

    multiply(other) {
        if (!(other instanceof Quat)) {
            throw new Error("Cannot multiply with non-quaternion");
        }
        let r = this.r * other.r - this.x * other.x - this.y * other.y - this.z * other.z;
        let x = this.r * other.x + this.x * other.r + this.y * other.z - this.z * other.y;
        let y = this.r * other.y - this.x * other.z + this.y * other.r + this.z * other.x;
        let z = this.r * other.z + this.x * other.y - this.y * other.x + this.z * other.r;
        this.r = r;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    inverse() {
        let i = 1.0 / (this.r * this.r + this.x * this.x + this.y * this.y + this.z * this.z);
        return new this(this.r * i, -this.x * i, -this.y * i, -this.z * i);
    }

    get norm() {
        return Math.sqrt(this.r * this.r + this.x * this.x + this.y * this.y + this.z * this.z);
    }

    conjugate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    normalize() {
        let i = 1.0 / this.norm;
        this.r *= i;
        this.x *= i;
        this.y *= i;
        this.z *= i;
        return this;
    }

    matrix4() {
        let aa = this.r * this.r;
        let bb = this.x * this.x;
        let cc = this.y * this.y;
        let dd = this.z * this.z;
        let bc = this.x * this.y;
        let cd = this.y * this.z;
        let bd = this.x * this.z;
        let ab = this.x * this.r;
        let ac = this.y * this.r;
        let ad = this.z * this.r;
        return new Matrix4([
            aa + bb - cc - dd, 2 * (bc - ad), 2 * (bd + ac), 0,
            2 * (bc + ad), aa - bb + cc - dd, 2 * (cd - ab), 0,
            2 * (bd - ac), 2 * (cd + ab), aa - bb - cc + dd, 0,
            0, 0, 0, 1,
        ]);
    }
}
