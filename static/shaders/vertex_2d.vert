attribute vec2 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat3 uTranformMatrix;
uniform mediump float uZorder;

varying lowp vec4 vColor;

void main() {
    gl_Position.xyz = uTranformMatrix * vec3(aVertexPosition, 1.0);
    gl_Position.z = uZorder;
    gl_Position.w = 1.0;
    vColor = aVertexColor;
}
