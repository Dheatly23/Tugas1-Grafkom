attribute vec3 aVertexPosition;

uniform mat4 uTranformMatrix;

void main() {
    gl_Position = uTranformMatrix * vec4(aVertexPosition.xyz, 1);
}
