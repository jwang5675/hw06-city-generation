#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

// Instance Rendering Columns
in vec4 vs_TransformCol1;
in vec4 vs_TransformCol2;
in vec4 vs_TransformCol3;
in vec4 vs_TransformCol4;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

// Assumes resolution is 2000 x 2000 throughout the program as input
vec4 screenToQuad(vec4 pos) {
    vec3 newPos = pos.xyz / 1000.0 - 1.0;
    return vec4(newPos, 1.0);
}

mat4 getTransformationMatrix() {
    return mat4(vs_TransformCol1, vs_TransformCol2, vs_TransformCol3, vs_TransformCol4);
}

void main() {
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    fs_Col = vs_Col;

    vec4 transformedPos = getTransformationMatrix() * vs_Pos;
    vec4 quadPos = screenToQuad(transformedPos);

    // Render the quads within a box of (-50, -50) and (50, 50)
    vec4 finalQuadPos = vec4(quadPos.x * 50.0, 0.1, quadPos.z * 50.0, 1.0);
    gl_Position = u_ViewProj * finalQuadPos;
}