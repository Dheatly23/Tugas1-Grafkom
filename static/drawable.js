let objects = [];
let camera = null;

function getPos(ev) {
    const cv = ev.target;
    return (new Vector2(ev.offsetX, ev.offsetY))
        .multiply(new Vector2(-2 / cv.height, -2 / cv.height))
        .add(new Vector2(cv.width / cv.height, 1))
        .sub(camera.position)
        .rotate(-camera.rotation)
        .divide(camera.scale);
}

class Polygon extends Object2D {
    constructor(gl, vertices=undefined) {
        super(gl);
        this.color = [0, 0, 0, 1];
        this.edgeColor = [0, 0, 0, 1];
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
            let index = new Uint16Array(l * 4);
            for (let i = 0; i < (l - 1); i++) {
                const ix = i * 3;
                index[ix] = i;
                index[ix + 1] = i + 1;
                index[ix + 2] = i + 2;
            }
            const ix = l * 3;
            index[ix - 4] = 0;
            index[ix - 3] = l - 1;
            index[ix - 2] = 0;
            index[ix - 1] = 1;
            for (let i = 0; i < l; i++) {
                index[ix + i] = i;
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
        }
        this.vertexCount = l;
        this.shader.setAttrib("aVertexColor", this.color);
        this.drawType = gl.TRIANGLES;
        this.indexCount = l * 3;
        this.indexOffset = 0;
        gl.disable(gl.CULL_FACE);
        super.draw(cameraMatrix, zscale, zoffset);
        this.shader.setAttrib("aVertexColor", this.edgeColor);
        this.drawType = gl.LINE_LOOP;
        this.indexOffset = this.indexCount * 2;
        this.indexCount = l;
        super.draw(cameraMatrix, zscale, zoffset);
        gl.enable(gl.CULL_FACE);
    }

    drawMove(ev) {
        if (!this.drawing) {
            return;
        }
        const pos = getPos(ev).sub(this.position);
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
        this.position = pos;
        this.vertices = [Vector2.zero(), Vector2.zero()];
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
        this.color = [0, 0, 0, 1];
        this.edgeColor = [0, 0, 0, 1];
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
        this.shader.setAttrib("aVertexColor", this.edgeColor);
        this.indexCount = l;
        super.draw(cameraMatrix, zscale, zoffset);
    }

    drawMove(ev) {
        if (!this.drawing) {
            return;
        }
        const pos = getPos(ev).sub(this.position);
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
        const pos = getPos(ev).sub(this.position);
        this.position = pos;
        this.vertices = [Vector2.zero(), Vector2.zero()];
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
        this.color = [0, 0, 0, 1];
        this.edgeColor = [0, 0, 0, 1];
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
        this.shader.setAttrib("aVertexColor", this.color);
        this.drawType = gl.TRIANGLE_FAN;
        gl.disable(gl.CULL_FACE);
        super.draw(cameraMatrix, zscale, zoffset);
        gl.enable(gl.CULL_FACE);
        this.shader.setAttrib("aVertexColor", this.edgeColor);
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
