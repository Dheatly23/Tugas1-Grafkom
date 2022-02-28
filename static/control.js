function colorToHex(color) {
    return "#"
        + color[0].toString(16).padStart(2, "0")
        + color[1].toString(16).padStart(2, "0")
        + color[2].toString(16).padStart(2, "0");
}

function hexToColor(hex) {
    return [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
        1.0,
    ];
}

function initControl(gl, shader) {
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnAdd = document.getElementById("btnAdd");
    const btnSub = document.getElementById("btnSub");
    const lstType = document.getElementById("lstType");
    const inXPos = document.getElementById("inXPos");
    const inYPos = document.getElementById("inYPos");
    const inColor = document.getElementById("inColor");
    const inEdgeColor = document.getElementById("inEdgeColor");
    const btnRedraw = document.getElementById("btnRedraw");

    let selIndex = 0;

    function updateInputData() {
        if (selIndex == objects.length) {
            lstType.selectedIndex = 0;
            lstType.disabled = false;
            inXPos.value = 0;
            inXPos.disabled = true;
            inYPos.value = 0;
            inYPos.disabled = true;
            inColor.value = "#000000";
            inColor.disabled = true;
            inEdgeColor.value = "#000000";
            inEdgeColor.disabled = true;
            btnRedraw.innerText = "Redraw";
            btnRedraw.disabled = true;
            return;
        }

        lstType.disabled = false;
        inXPos.disabled = false;
        inYPos.disabled = false;
        inColor.disabled = false;
        inEdgeColor.disabled = false;

        const obj = objects[selIndex];
        if (obj instanceof LineStrip)
            lstType.selectedIndex = 1;
        else if (obj instanceof Rectangle)
            lstType.selectedIndex = 2;
        else if (obj instanceof Polygon)
            lstType.selectedIndex = 3;
        inXPos.value = obj.position.x;
        inYPos.value = obj.position.y;
        inColor.value = colorToHex(obj.color);
        inEdgeColor.value = colorToHex(obj.edgeColor);
        if (obj.drawing !== false) {
            btnRedraw.innerText = "Drawing";
            btnRedraw.disabled = true;
            inXPos.disabled = true;
            inYPos.disabled = true;
        } else {
            btnRedraw.innerText = "Redraw";
            btnRedraw.disabled = false;
        }
    }
    updateInputData();

    btnPrev.addEventListener("click", (ev) => {
        selIndex -= 1;
        if (selIndex < 0)
            selIndex = 0;
        updateInputData();
    });
    btnNext.addEventListener("click", (ev) => {
        selIndex += 1;
        if (selIndex > objects.length)
            selIndex = objects.length;
        updateInputData();
    });
    btnAdd.addEventListener("click", (ev) => {
        const obj = new LineStrip(gl);
        obj.shader = shader;
        if (selIndex != objects.length) {
            objects.splice(selIndex, 0, obj);
        } else {
            objects.push(obj);
        }
        updateInputData();
    });
    btnSub.addEventListener("click", (ev) => {
        if (selIndex != objects.length) {
            const obj = objects[selIndex];
            obj.destroy();
            objects.splice(selIndex, 1);
            if (selIndex > objects.length)
                selIndex = objects.length;
            updateInputData();
        }
    });

    lstType.addEventListener("change", (ev) => {
        let obj = objects[selIndex];
        if ((lstType.selectedIndex == 1) && !(obj instanceof LineStrip)) {
            if (obj !== undefined)
                obj.destroy();
            obj = new LineStrip(gl);
            obj.shader = shader;
            objects[selIndex] = obj;
            updateInputData();
        } else if ((lstType.selectedIndex == 2) && !(obj instanceof Rectangle)) {
            if (obj !== undefined)
                obj.destroy();
            obj = new Rectangle(gl);
            obj.shader = shader;
            objects[selIndex] = obj;
            updateInputData();
        } else if ((lstType.selectedIndex == 3) && !(obj instanceof Polygon)) {
            if (obj !== undefined)
                obj.destroy();
            obj = new Polygon(gl);
            obj.shader = shader;
            objects[selIndex] = obj;
            updateInputData();
        }
    });
    inXPos.addEventListener("change", (ev) => {
        const obj = objects[selIndex];
        obj.position.x = inYPos.value;
    });
    inYPos.addEventListener("change", (ev) => {
        const obj = objects[selIndex];
        obj.position.y = inYPos.value;
    });
    inColor.addEventListener("change", (ev) => {
        const obj = objects[selIndex];
        obj.color = hexToColor(inColor.value);
    });
    inEdgeColor.addEventListener("change", (ev) => {
        const obj = objects[selIndex];
        obj.color = hexToColor(inEdgeColor.value);
    });

    btnRedraw.addEventListener("click", (ev) => {
        const obj = objects[selIndex];
        obj.drawing = null;
        updateInputData();
    });

    gl.canvas.addEventListener("mousemove", (ev) => {
        const last = objects[selIndex];
        if (last === undefined) {
            return;
        }
        last.drawMove(ev);
        updateInputData();
    });
    gl.canvas.addEventListener("click", (ev) => {
        const last = objects[selIndex];
        if (last === undefined) {
            return;
        }
        if (last.drawing === null) {
            last.drawBegin(ev);
            updateInputData();
        } else {
            last.drawClick(ev);
        }
    });

    const txtSavedata = document.getElementById("txtSavedata");
    const btnLoad = document.getElementById("btnLoad");
    const btnSave = document.getElementById("btnSave");

    btnSave.addEventListener("click", (ev) => {
        txtSavedata.value = btoa(JSON.stringify(objects.map((e) => {
            if (e instanceof LineStrip) {
                return {
                    "type": "line",
                    "position": [e.position.x, e.position.y],
                    "color": e.color,
                    "edgeColor": e.edgeColor,
                    "coords": e.vertices.map((v) => [v.x, v.y]),
                };
            } else if (e instanceof Polygon) {
                return {
                    "type": "polygon",
                    "position": [e.position.x, e.position.y],
                    "color": e.color,
                    "edgeColor": e.edgeColor,
                    "coords": e.vertices.map((v) => [v.x, v.y]),
                };
            } else if (e instanceof Rectangle) {
                return {
                    "type": "rectangle",
                    "position": [e.position.x, e.position.y],
                    "color": e.color,
                    "edgeColor": e.edgeColor,
                    "width": e.width,
                    "height": e.height,
                };
            } else {
                throw new Error(e);
            }
        })));
    });
    btnLoad.addEventListener("click", (ev) => {
        let arr = JSON.parse(atob(txtSavedata.value)).map((e) => {
            if (e.type === "line") {
                let obj = new LineStrip(gl);
                obj.position.x = e.position[0];
                obj.position.y = e.position[1];
                obj.color = [e.color[0], e.color[1], e.color[2], e.color[3]];
                obj.edgeColor = [e.color[0], e.color[1], e.color[2], e.color[3]];
                obj.shader = shader;
                obj.drawing = false;
                obj.vertices = e.coords.map((v) => new Vector2(v[0], v[1]));
                return obj;
            } else if (e.type === "polygon") {
                let obj = new Polygon(gl);
                obj.position.x = e.position[0];
                obj.position.y = e.position[1];
                obj.color = [e.color[0], e.color[1], e.color[2], e.color[3]];
                obj.edgeColor = [e.color[0], e.color[1], e.color[2], e.color[3]];
                obj.shader = shader;
                obj.drawing = false;
                obj.vertices = e.coords.map((v) => new Vector2(v[0], v[1]));
                return obj;
            } else if (e.type === "rectangle") {
                let obj = new Rectangle(gl);
                obj.position.x = e.position[0];
                obj.position.y = e.position[1];
                obj.color = [e.color[0], e.color[1], e.color[2], e.color[3]];
                obj.edgeColor = [e.color[0], e.color[1], e.color[2], e.color[3]];
                obj.shader = shader;
                obj.drawing = false;
                obj.width = e.width;
                obj.height = e.height;
                return obj;
            } else {
                throw new Error(e);
            }
        });
        while (objects.length > 0) {
            objects.pop().destroy();
        }
        arr.forEach((e, ix) => {
            objects[ix] = e;
        });
        selIndex = 0;
        updateInputData();
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
            const last = objects[selIndex];
            if (last !== undefined) {
                last.drawEnd(null);
                updateInputData();
            }
        }
    }

    return processKeystate;
}
