uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;

void main() {
    float wave = sin(vUv.y * 10.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 color = mix(uColorStart, uColorEnd, wave);
    gl_FragColor = vec4(color, 1.0);
}
