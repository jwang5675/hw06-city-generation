import { vec4 } from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import { gl } from '../globals';
class Cube extends Drawable {
    constructor(center) {
        super(); // Call the constructor of the super class. This is required.
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    }
    create() {
        this.numInstances = 1;
        let vertices = [
            [-0.5, 0, -0.5],
            [0.5, 0, -0.5],
            [0.5, 1, -0.5],
            [-0.5, 1, -0.5],
            [-0.5, 0, 0.5],
            [0.5, 0, 0.5],
            [0.5, 1, 0.5],
            [-0.5, 1, 0.5],
        ];
        let vertIndx = [
            0, 1, 3, 3, 1, 2,
            1, 5, 2, 2, 5, 6,
            5, 4, 6, 6, 4, 7,
            4, 0, 7, 7, 0, 3,
            3, 2, 7, 7, 2, 6,
            4, 5, 0, 0, 5, 1,
        ];
        let vertNormals = [
            [0, 0, 1],
            [1, 0, 0],
            [0, 0, -1],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
        ];
        this.indices = new Uint32Array(36);
        for (let i = 0; i < 36; i++) {
            this.indices[i] = i;
        }
        this.positions = new Float32Array(4 * 36);
        for (let i = 0; i < 36; i++) {
            this.positions[i * 4 + 0] = vertices[vertIndx[i]][0] + this.center[0];
            this.positions[i * 4 + 1] = vertices[vertIndx[i]][1] + this.center[1];
            this.positions[i * 4 + 2] = vertices[vertIndx[i]][2] + this.center[2];
            this.positions[i * 4 + 3] = 1;
        }
        this.normals = new Float32Array(4 * 36);
        for (let i = 0; i < 36; i++) {
            let faceNumber = Math.floor(i / 6);
            this.normals[i * 4 + 0] = vertNormals[faceNumber][0];
            this.normals[i * 4 + 1] = vertNormals[faceNumber][1];
            this.normals[i * 4 + 2] = vertNormals[faceNumber][2];
            this.normals[i * 4 + 3] = 0;
        }
        this.generateIdx();
        this.generatePos();
        this.generateNor();
        this.generateTransformCol1();
        this.generateTransformCol2();
        this.generateTransformCol3();
        this.generateTransformCol4();
        this.generateCol();
        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
        console.log(`Created cube`);
    }
    setInstanceVBOsTransform(col1, col2, col3, col4, colors) {
        this.col1 = col1;
        this.col2 = col2;
        this.col3 = col3;
        this.col4 = col4;
        this.colors = colors;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol1);
        gl.bufferData(gl.ARRAY_BUFFER, this.col1, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol2);
        gl.bufferData(gl.ARRAY_BUFFER, this.col2, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol3);
        gl.bufferData(gl.ARRAY_BUFFER, this.col3, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol4);
        gl.bufferData(gl.ARRAY_BUFFER, this.col4, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    }
}
;
export default Cube;
//# sourceMappingURL=Cube.js.map