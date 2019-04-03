#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;
const float fov = 0.7853975; // = 45.0 * 3.14159 / 180.0

float rand(vec2 pos) {
    return fract(sin(dot(pos.xy ,vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 smoothF(vec2 pos) {
    return pos * pos * (3.0 - 2.0 * pos);
}

float noise(vec2 uv) {
    const float k = 257.0;
    vec4 l  = vec4(floor(uv), fract(uv));
    float u = l.x + l.y * k;
    vec4 v = vec4(u, u + 1.0, u + k, u + k + 1.0);
    v = fract(fract(1.23456789 * v) * v / 0.987654321);
    l.zw = smoothF(l.zw);
    l.x = mix(v.x, v.y, l.z);
    l.y = mix(v.z, v.w, l.z);
    return mix(l.x, l.y, l.w);
}

float fbm(vec2 pos) {
    float amp = 0.5;
    float freq = 5.0;
    float ret = 0.0;
    for(int i = 0; i < 8; i++) {
        ret += noise(pos * freq) * amp;
        amp *= .5;
        freq *= 2.;
    }
    return ret;
}

vec2 sphereToUV(vec3 p) {
    float phi = atan(p.z, p.x);
    if(phi < 0.0) {
        phi += TWO_PI;
    }
    float theta = acos(p.y);
    return vec2(1.0 - phi / TWO_PI, 1.0 - theta / PI);
}

void main() {
    vec3 u_Right = normalize(cross(u_Ref - u_Eye, u_Up));
    float len = length(u_Ref - u_Eye);
    float aspectRatio = u_Dimensions.x / u_Dimensions.y;
    vec3 v = tan(fov / 2.0) * len * u_Up;
    vec3 h = aspectRatio * tan(fov / 2.0) * len * u_Right;
    vec3 point = u_Ref + fs_Pos.x * h + fs_Pos.y * v;
    vec3 ray_direction = normalize(point - u_Eye);

    vec3 color = 0.5 * (ray_direction + vec3(1.0, 1.0, 1.0)) + vec3(fbm(fs_Pos)) / 2.0;

    // Add Stars
    if (rand(ray_direction.xy) > 0.995) {
        color = color + vec3(5.0);
    }

    out_Col = vec4(color, 8.0) / 8.0 + vec4(0.4, 0.7, 1, 0.0) / 1.7;
}
