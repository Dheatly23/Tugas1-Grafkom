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

    let shader = await shaderRegistry.loadShaderProgram("vertex.vert", "fragment.frag");

    class Cube extends Object3D {
        constructor(gl) {
            super(gl);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    -1.0, -1.0, -1.0,
                    -1.0, -1.0, 1.0,
                    -1.0, 1.0, -1.0,
                    -1.0, 1.0, 1.0,
                    1.0, -1.0, -1.0,
                    1.0, -1.0, 1.0,
                    1.0, 1.0, -1.0,
                    1.0, 1.0, 1.0,
                ]),
                gl.STATIC_DRAW,
            );
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array([
                    // Front
                    0, 4, 2,
                    2, 4, 6,
                    // Back
                    1, 3, 5,
                    5, 3, 7,
                    // Up
                    2, 6, 3,
                    3, 6, 7,
                    // Down
                    0, 1, 4,
                    4, 1, 5,
                    // Left
                    0, 2, 1,
                    1, 2, 3,
                    // Right
                    4, 5, 6,
                    6, 5, 7,
                ]),
                gl.STATIC_DRAW,
            );
            this.indexCount = 6 * 2 * 3;
        }
    }

    let cube = new Cube(gl);
    cube.position.z = 5;
    cube.rotation = Quat.rotateY(-Math.PI / 4).multiply(Quat.rotateX(Math.PI / 4));
    cube.shader = shader;

    let camera = new CameraViewPerspective(gl);
    camera.draw([
        cube,
    ]);
}

window.onload = main;
