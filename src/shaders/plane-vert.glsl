#version 300 es
precision highp float;

uniform mat4 u_ViewProj;

in vec4 vs_Pos;
out vec2 fs_Pos;

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

float getWaterMap(vec2 pos) {
	vec2 elevationPos = pos - vec2(1.1, 0.4);
	float fbm = fbm(elevationPos / 2.0);
	fbm = clamp((fbm - 0.378) / 0.622, 0.0, 1.0);
	return fbm == 0.0 ? 0.0 : 1.0;
}

vec2 getQuadToMapPos() {
	float originalX = (fs_Pos.x + 1.0) / 2.0;
	float originalY = (fs_Pos.y + 1.0) / 2.0;
	float x = mix(-0.15, 0.35, originalX);
	float y = mix(0.057, 0.557, originalY);
	return vec2(x, y);
}

void main() {
  fs_Pos = vs_Pos.xz;
  vec3 pos = vec3(vs_Pos.x, 0.0, vs_Pos.z) * 50.0;
  
  vec2 mapPos = getQuadToMapPos();
  float waterValue = getWaterMap(mapPos);
  if (waterValue == 0.0) {
  	pos.y = pos.y - 1.0;
  }

  gl_Position = u_ViewProj * vec4(pos, 1.0);
}
