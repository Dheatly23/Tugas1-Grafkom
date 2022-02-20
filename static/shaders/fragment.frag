uniform mediump float uBrightness;

void main() {
    gl_FragColor = vec4(uBrightness, uBrightness, uBrightness, 1.0);
}
