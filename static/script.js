//
// start here
//
async function main() {
    const canvas = document.getElementById("glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl2");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    let shaderRegistry = new ShaderRegistry(gl);

    let shader = await shaderRegistry.loadShaderProgram("vertex_2d.vert", "fragment.frag");

    class Polygon extends Object2D {
        constructor(gl, vertices=undefined) {
            super(gl);
            if (vertices === undefined) {
                vertices = [];
            }
            this.vertices = vertices;
            this.vertexCount = 0;
            this.drawing = null;
        }

        draw(cameraMatrix, zscale, zoffset) {
            const l = this.vertices.length;
            if (l == 0) {
                return;
            }
            let data = new Float32Array(l * 2);
            this.vertices.forEach((e, ix) => {
                let i = ix * 2;
                data[i] = e.x;
                data[i + 1] = e.y;
            });

            const gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
            if (this.vertexCount != l) {
                let index = new Uint16Array(l * 4 - 3);
                for (let i = 0; i < (l - 1); i++) {
                    const ix = i * 3;
                    index[ix] = i;
                    index[ix + 1] = i + 1;
                    index[ix + 2] = i + 2;
                }
                const ix = l * 3 - 4;
                for (let i = 0; i < l; i++) {
                    index[ix + i] = i;
                }
                index[index.length - 1] = 0;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
            }
            this.vertexCount = l;
            this.shader.setAttrib("aVertexColor", [0.0, 0.0, 0.0, 1.0]);
            this.drawType = gl.TRIANGLES;
            this.indexCount = l * 3 - 3;
            this.indexOffset = 0;
            gl.disable(gl.CULL_FACE);
            super.draw(cameraMatrix, zscale, zoffset);
            gl.enable(gl.CULL_FACE);
            this.shader.setAttrib("aVertexColor", [0.0, 0.0, 0.0, 1.0]);
            this.drawType = gl.LINE_LOOP;
            this.indexOffset = (this.indexCount - 2) * 2;
            this.indexCount = l + 1;
            super.draw(cameraMatrix, zscale, zoffset);
        }

        drawMove(ev) {
            if (!this.drawing) {
                return;
            }
            const pos = getPos(ev);
            this.vertices[this.vertices.length - 1] = pos;
        }
        drawClick(ev) {
            if (!this.drawing) {
                return;
            }
            this.vertices.push(this.vertices[this.vertices.length - 1]);
        }
        drawBegin(ev) {
            if (this.drawing !== null) {
                return;
            }
            this.drawing = true;
            const pos = getPos(ev);
            this.vertices.push(pos);
            this.vertices.push(pos);
        }
        drawEnd(ev) {
            if (!this.drawing) {
                return;
            }
            this.drawing = false;
            this.vertices.pop();
        }
    }

    class LineStrip extends Object2D {
        constructor(gl, vertices=undefined) {
            super(gl);
            this.drawType = gl.LINE_STRIP;
            if (vertices === undefined) {
                vertices = [];
            }
            this.vertices = vertices;
            this.vertexCount = 0;
            this.drawing = null;
        }

        draw(cameraMatrix, zscale, zoffset) {
            const l = this.vertices.length;
            if (l == 0) {
                return;
            }
            let data = new Float32Array(l * 2);
            this.vertices.forEach((e, ix) => {
                let i = ix * 2;
                data[i] = e.x;
                data[i + 1] = e.y;
            });

            const gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
            if (this.vertexCount != l) {
                let index = new Uint16Array(l);
                for (let i = 0; i < l; i++) {
                    index[i] = i;
                }
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
            }
            this.vertexCount = l;
            this.shader.setAttrib("aVertexColor", [0.0, 0.0, 0.0, 1.0]);
            this.indexCount = l;
            super.draw(cameraMatrix, zscale, zoffset);
        }

        drawMove(ev) {
            if (!this.drawing) {
                return;
            }
            const pos = getPos(ev);
            this.vertices[this.vertices.length - 1] = pos;
        }
        drawClick(ev) {
            if (!this.drawing) {
                return;
            }
            this.vertices.push(this.vertices[this.vertices.length - 1]);
        }
        drawBegin(ev) {
            if (this.drawing !== null) {
                return;
            }
            this.drawing = true;
            const pos = getPos(ev);
            this.vertices.push(pos);
            this.vertices.push(pos);
        }
        drawEnd(ev) {
            if (!this.drawing) {
                return;
            }
            this.drawing = false;
            this.vertices.pop();
        }
    }

    class Rectangle extends Object2D {
        constructor(gl, vertices=undefined) {
            super(gl);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array([
                    0, 1, 2, 3,
                ]),
                gl.STATIC_DRAW,
            );
            this.indexCount = 4;
            this.width = 0;
            this.height = 0;
            this.drawing = null;
        }

        draw(cameraMatrix, zscale, zoffset) {
            const gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    0, 0,
                    0, this.height,
                    this.width, this.height,
                    this.width, 0,
                ]),
                gl.DYNAMIC_DRAW,
            );
            this.shader.setAttrib("aVertexColor", [0.0, 0.0, 0.0, 1.0]);
            this.drawType = gl.TRIANGLE_FAN;
            gl.disable(gl.CULL_FACE);
            super.draw(cameraMatrix, zscale, zoffset);
            gl.enable(gl.CULL_FACE);
            this.shader.setAttrib("aVertexColor", [0.0, 0.0, 0.0, 1.0]);
            this.drawType = gl.LINE_LOOP;
            super.draw(cameraMatrix, zscale, zoffset);
        }

        drawMove(ev) {
            if (!this.drawing) {
                return;
            }
            const dp = getPos(ev).sub(this.position);
            this.width = dp.x;
            this.height = dp.y;
        }
        drawClick(ev) {
            if (!this.drawing) {
                return;
            }
            this.drawEnd(ev);
        }
        drawBegin(ev) {
            if (this.drawing !== null) {
                return;
            }
            this.drawing = true;
            this.position = getPos(ev);
        }
        drawEnd(ev) {
            if (!this.drawing) {
                return;
            }
            this.drawing = false;
        }
    }

    let poly = new Polygon(gl);
    poly.shader = shader;
    let rect = new Rectangle(gl);
    rect.width = 1;
    rect.height = 0.5;
    rect.shader = shader;

    let objects = [rect, poly];
    let camera = new CameraView2D(gl);

    function getPos(ev) {
        const cv = ev.target;
        return (new Vector2(ev.offsetX, ev.offsetY))
            .multiply(new Vector2(-2 / cv.height, -2 / cv.height))
            .add(new Vector2(cv.width / cv.height, 1))
            .sub(camera.position)
            .rotate(-camera.rotation)
            .divide(camera.scale);
    }

    canvas.addEventListener("mousemove", (ev) => {
        const last = objects[objects.length - 1];
        if (last === undefined) {
            return;
        }
        last.drawMove(ev);
    });
    canvas.addEventListener("click", (ev) => {
        const last = objects[objects.length - 1];
        if (last === undefined) {
            return;
        }
        if (last.drawing === null) {
            last.drawBegin(ev);
        } else {
            last.drawClick(ev);
        }
    });

    let keystate = {
        "up": false,
        "down": false,
        "left": false,
        "right": false,
        "end": false,
    }

    const keybind = {
        "ArrowUp": "up",
        "ArrowDown": "down",
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "KeyW": "up",
        "KeyS": "down",
        "KeyA": "left",
        "KeyD": "right",
        "Escape": "end",
    };

    document.addEventListener("keydown", (ev) => {
        const state = keybind[ev.code];
        if (state !== undefined) {
            keystate[state] = true;
        }
    });
    document.addEventListener("keyup", (ev) => {
        const state = keybind[ev.code];
        if (state !== undefined) {
            keystate[state] = false;
        }
    });

    function processKeystate(delta) {
        const moveRate = 1.0;

        if (keystate.up) {
            camera.position.y -= moveRate * delta;
        }
        if (keystate.down) {
            camera.position.y += moveRate * delta;
        }
        if (keystate.left) {
            camera.position.x -= moveRate * delta;
        }
        if (keystate.right) {
            camera.position.x += moveRate * delta;
        }

        if (keystate.end) {
            const last = objects[objects.length - 1];
            if (last !== undefined) {
                last.drawEnd(null);
            }
        }
    }

    let prev = 0;

    function process(now) {
        now *= 0.001;
        const delta = now - prev;
        prev = now;

        processKeystate(delta);
        camera.draw(objects);
        window.requestAnimationFrame(process);
    }

    window.requestAnimationFrame(process);
}

window.onload = main;
