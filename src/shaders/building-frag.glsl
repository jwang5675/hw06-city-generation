#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec4 fs_WorldPos;

out vec4 out_Col;

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
    out_Col = vec4(color, 1.0);
}