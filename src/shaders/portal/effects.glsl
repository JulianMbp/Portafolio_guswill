uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;

// Aquí puedes pegar la función cnoise que ya tienes
// ... cnoise code ...

void main() {
    vec2 uv = vUv - 0.5;

    // Remolino
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float swirl = sin(radius * 10.0 - uTime * 3.0 + angle * 5.0);

    // Niebla
    float fog = smoothstep(0.4, 0.5, radius);

    float strength = swirl;
    vec3 color = mix(uColorStart, uColorEnd, strength);
    color = mix(color, vec3(0.1, 0.1, 0.2), fog);

    gl_FragColor = vec4(color, 1.0);
}
