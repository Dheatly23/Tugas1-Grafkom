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

    function getPos(ev) {
        const cv = ev.target;
        return (new Vector2(ev.offsetX, ev.offsetY))
            .multiply(new Vector2(-2 / cv.height, -2 / cv.height))
            .add(new Vector2(cv.width / cv.height, 1));
    }

    class Polygon extends Object2D {
        constructor(gl, vertices=undefined) {
            super(gl);
            this.drawType = gl.LINE_LOOP;
            if (vertices === undefined) {
                vertices = [];
            }
            this.vertices = vertices;
            this.drawing = null;
        }

        draw(cameraMatrix, zscale, zoffset) {
            this.vertexCount = this.vertices.length;
            let data = new Float32Array(this.vertices.length * 2);
            this.vertices.forEach((e, ix) => {
                let i = ix * 2;
                data[i] = e.x;
                data[i + 1] = e.y;
            });

            const gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
            this.shader.setAttrib("aVertexColor", [0.0, 0.0, 0.0, 1.0]);
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

    let square = new Polygon(gl, [
    ]);
    square.shader = shader;

    let objects = [square];
    let camera = new CameraView2D(gl);

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
