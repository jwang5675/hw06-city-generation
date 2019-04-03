#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec4 fs_WorldPos;
in vec3 fs_Helper;

out vec4 out_Col;

float rand(vec2 pos) {
    return fract(sin(dot(pos.xy ,vec2(12.9898, 78.233))) * 43758.5453);
}

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 perm(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float cloudsnoise(vec3 p) {
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float fbm3(vec3 pos) {
    float amp = 0.5;
    float freq = 5.0;
    float ret = 0.0;
    for(int i = 0; i < 8; i++) {
        ret += cloudsnoise(pos * freq) * amp;
        amp *= .5;
        freq *= 2.;
    }
    return ret;
}

vec3 lambert(vec3 normal, vec3 direction, vec3 color) {
	float diffuseTerm = dot(normalize(normal), normalize(direction));
	diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
	float ambientTerm = 0.2;

	float lightIntensity = diffuseTerm + ambientTerm;
	return clamp(vec3(color.rgb * lightIntensity), 0.0, 1.0);
}

void main() {
	vec3 lightPos = vec3(0, 200, 0);
	vec3 color = lambert(fs_Nor.xyz, lightPos - fs_WorldPos.xyz, fs_Col.xyz);

	float val = floor(mod(fs_WorldPos.y + 10.0 * rand(fs_Helper.xy), 20.0));
	if (mod(val, 3.0) == 0.0) {
		if (fs_WorldPos.y < fs_Helper.z - 1.0) {
			color = clamp(3.0 * color + vec3(0.4, 0.4, 0.2), 0.0, 0.9);
		}
	}

	color = clamp(color + fbm3(vec3(fs_WorldPos.x, fs_WorldPos.y, fs_WorldPos.z)) / 10.0, 0.0, 0.9);
    out_Col = vec4(color, 1.0);
}