attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uTranformMatrix;

varying lowp vec4 vColor;

void main() {
    gl_Position = uTranformMatrix * vec4(aVertexPosition.xyz, 1);
    vColor = aVertexColor;
}
