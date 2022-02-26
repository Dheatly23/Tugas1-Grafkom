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
            this.drawType = gl.LINE_LOOP;
            if (vertices === undefined) {
                vertices = [];
            }
            this.vertices = vertices;
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
    }

    let square = new Polygon(gl, [
        new Vector2(0, 0),
        new Vector2(0, 1),
        new Vector2(1, 1),
        new Vector2(1, 0),
    ]);
    square.shader = shader;

    let objects = [square];
    let camera = new CameraView2D(gl);

    let keystate = {
        "up": false,
        "down": false,
        "left": false,
        "right": false,
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
