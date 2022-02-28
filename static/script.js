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
    camera = new CameraView2D(gl);

    const processKeystate = initControl(gl, shader);

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
