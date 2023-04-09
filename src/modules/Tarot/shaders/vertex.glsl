#define GLSLIFY 1
varying vec2 vUv;

void main () {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
}
