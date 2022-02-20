class WithGl {
    constructor(gl) {
        Object.defineProperty(this, "gl", {
            enumerable: true,
            value: gl,
        });
    }
}

class ShaderProgram extends WithGl {
    static #uniformMap = Object.frozen({
        [0x1406]: (gl, loc) => ((v) => gl.uniform1f(loc, v)),
        [0x8B50]: (gl, loc) => ((v) => gl.uniform2fv(loc, v)),
        [0x8B51]: (gl, loc) => ((v) => gl.uniform3fv(loc, v)),
        [0x8B52]: (gl, loc) => ((v) => gl.uniform4fv(loc, v)),
        [0x1404]: (gl, loc) => ((v) => gl.uniform1i(loc, v)),
        [0x8B53]: (gl, loc) => ((v) => gl.uniform2iv(loc, v)),
        [0x8B54]: (gl, loc) => ((v) => gl.uniform3iv(loc, v)),
        [0x8B55]: (gl, loc) => ((v) => gl.uniform4iv(loc, v)),
        [0x8B56]: (gl, loc) => ((v) => gl.uniform1i(loc, v)),
        [0x8B57]: (gl, loc) => ((v) => gl.uniform2iv(loc, v)),
        [0x8B58]: (gl, loc) => ((v) => gl.uniform3iv(loc, v)),
        [0x8B59]: (gl, loc) => ((v) => gl.uniform4iv(loc, v)),
        [0x8B5A]: (gl, loc) => ((v) => gl.uniformMatrix2fv(loc, false, v)),
        [0x8B5B]: (gl, loc) => ((v) => gl.uniformMatrix3fv(loc, false, v)),
        [0x8B5C]: (gl, loc) => ((v) => gl.uniformMatrix4fv(loc, false, v)),
        [0x8B5D]: (gl, loc) => ((v) => gl.uniform1i(loc, v)),
        [0x8B60]: (gl, loc) => ((v) => gl.uniform1i(loc, v)),
    });

    static #attribMap = Object.frozen({
        [0x1406]: (gl, loc, v) => gl.vertexAttrib1f(loc, v),
        [0x8B50]: (gl, loc, v) => gl.vertexAttrib2fv(loc, v),
        [0x8B51]: (gl, loc, v) => gl.vertexAttrib3fv(loc, v),
        [0x8B52]: (gl, loc, v) => gl.vertexAttrib4fv(loc, v),
    });

    constructor(gl, program) {
        super(gl);
        const n_uniform = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        let uniform = {};
        for (let i = 0; i < n_uniform; ++i) {
            let v = gl.getActiveUniform(program, i);
            let loc = gl.getUniformLocation(program, v.name);
            let s = ShaderProgram.#uniformMap[v.type](gl, loc);
            if (s === undefined)
                console.warn("Unknown type " + v.type.toString(16).padStart(4, "0"));
            Object.defineProperty(uniform, v.name, {
                enumerable: true,
                get: () => gl.getUniform(program, loc),
                set: s,
            });
        }
        Object.defineProperties(this, {
            program: {
                enumerable: true,
                value: program,
            },
            uniform: {
                enumerable: true,
                value: Object.seal(uniform),
            },
        });
    }

    get attributes() {
        const gl = this.gl;
        const prog = this.program;
        const n_attrib = gl.getProgramParameter(prog, gl.ACTIVE_ATTRIBUTES);
        let ret = Array(n_attrib);
        for (let i = 0; i < n_attrib; ++i) {
            ret[i] = gl.getActiveAttrib(prog, i).name;
        }
        return ret;
    }

    get attributeInfo() {
        const gl = this.gl;
        const prog = this.program;
        const n_attrib = gl.getProgramParameter(prog, gl.ACTIVE_ATTRIBUTES);
        let ret = Array(n_attrib);
        for (let i = 0; i < n_attrib; ++i) {
            ret[i] = gl.getActiveAttrib(prog, i);
        }
        return ret;
    }

    setAttrib(name, v) {
        const gl = this.gl;
        const prog = this.program;
        const loc = gl.getAttribLocation(prog, name);
        if (loc == -1)
            return;
        const desc = gl.getActiveAttrib(prog, loc);
        let f = ShaderProgram.#attribMap[desc.type];
        if (f !== undefined) {
            gl.disableVertexAttribArray(loc);
            f(gl, loc, v);
        } else
            console.warn("Unknown type " + desc.type.toString(16).padStart(4, "0"));
    }

    setAttribBuffer(name, buf, size, type, normalized, stride, offset) {
        const gl = this.gl;
        const prog = this.program;
        const loc = gl.getAttribLocation(prog, name);
        if (loc === -1)
            return;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, type, normalized, stride, offset);
    }

    useProgram() {
        this.gl.useProgram(this.program);
    }
}

class ShaderRegistry {
    #shaders;

    constructor(gl) {
        super(gl);
        this.#shaders = {};
    }

    async loadShader(name, type) {
        const gl = this.gl;
        if (this.#shaders[name] === undefined) {
            const shader = gl.createShader(type);
            this.#shaders[name] = fetch("shaders/" + name, {cache: "no-cache"})
                .then(async function (response) {
                    if (!response.ok) {
                        throw new Error("Response code error (" + response.status + ")");
                    }
                    gl.shaderSource(shader, await response.text());
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        throw new Error(gl.getShaderInfoLog(shader));
                    }
                    return shader;
                });
        }
        return this.#shaders[name];
    }

    async loadShaderProgram(vert, frag) {
        const gl = this.gl;
        const vertShader = this.loadShader(vert, gl.VERTEX_SHADER);
        const fragShader = this.loadShader(frag, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        gl.attachShader(program, await vertShader);
        gl.attachShader(program, await fragShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS) {
            throw new Error(gl.getProgramInfoLog(program));
        }
        return new ShaderProgram(gl, program);
    }
}

class WithTransform extends WithGl {
    #position;
    #rotation;
    #scale;

    constructor(gl) {
        super(gl);
        this.#position = Vector3.zero();
        this.#rotation = new Quat();
        this.#scale = Vector3.one();
    }

    get position() {
        return this.#position;
    }

    set position(v) {
        if (v instanceof Vector3)
            this.#position = v;
    }

    get rotation() {
        return this.#rotation;
    }

    set rotation(v) {
        if (v instanceof Quat)
            this.#rotation = v;
    }

    get scale() {
        return this.#scale;
    }

    set scale(v) {
        if (v instanceof Vector3)
            this.#scale = v;
    }

    get transform() {
        return Matrix4.identity()
            .scale(this.#scale.x, this.#scale.y, this.#scale.z)
            .multiply(this.#rotation.matrix4())
            .translate(this.#scale.x, this.#scale.y, this.#scale.z);
    }
}

class Object3D extends WithTransform {
    constructor(gl) {
        super(gl);
        this.vbo = gl.createBuffer();
        this.index = gl.createBuffer();
        this.shader = null;
    }

    update(delta) {
    }

    draw(cameraMatrix) {
    }
}

class CameraView extends WithTransform {
    constructor(gl, fov = Math.PI / 3, aspect = 1.0, near = 0.1, far = 100) {
        super(gl);
        this.fov = fov;
        this.aspectRatio = aspect;
        this.near = near;
        this.far = far;
    }

    draw(objects) {
        const gl = this.gl;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const cameraMatrix = this.transform.multiply(Matrix4.perspective(
            this.fov,
            this.aspectRatio,
            this.near,
            this.far,
        ));
        objects.forEach(function (obj) {
            obj.draw(new Matrix4(cameraMatrix));
        });
    }
}