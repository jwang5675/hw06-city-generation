import Drawable from '../rendering/gl/Drawable';
import { gl } from '../globals';
class Square extends Drawable {
    constructor() {
        super(); // Call the constructor of the super class. This is required.
    }
    create() {
        this.indices = new Uint32Array([0, 1, 2,
            0, 2, 3]);
        this.positions = new Float32Array([-0.5, 0, -0.5, 1,
            0.5, 0, -0.5, 1,
            0.5, 0, 0.5, 1,
            -0.5, 0, 0.5, 1]);
        this.generateIdx();
        this.generatePos();
        this.generateCol();
        //this.generateTranslate();
        this.generateTransformCol1();
        this.generateTransformCol2();
        this.generateTransformCol3();
        this.generateTransformCol4();
        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
        console.log(`Created square`);
    }
    setInstanceVBOs(offsets, colors) {
        this.colors = colors;
        this.offsets = offsets;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
        gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
    }
    setInstanceVBOsFullTransform(col1, col2, col3, col4, colors) {
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
export default Square;
//# sourceMappingURL=Square.js.map