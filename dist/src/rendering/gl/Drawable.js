import { gl } from '../../globals';
class Drawable {
    constructor() {
        this.count = 0;
        this.idxGenerated = false;
        this.posGenerated = false;
        this.norGenerated = false;
        this.colGenerated = false;
        this.translateGenerated = false;
        this.transformCol1Generated = false;
        this.transformCol2Generated = false;
        this.transformCol3Generated = false;
        this.transformCol4Generated = false;
        this.uvGenerated = false;
        this.numInstances = 0; // How many instances of this Drawable the shader program should draw
    }
    destory() {
        gl.deleteBuffer(this.bufIdx);
        gl.deleteBuffer(this.bufPos);
        gl.deleteBuffer(this.bufNor);
        gl.deleteBuffer(this.bufCol);
        gl.deleteBuffer(this.bufTranslate);
        gl.deleteBuffer(this.bufTransformCol1);
        gl.deleteBuffer(this.bufTransformCol2);
        gl.deleteBuffer(this.bufTransformCol3);
        gl.deleteBuffer(this.bufTransformCol4);
        gl.deleteBuffer(this.bufUV);
    }
    generateIdx() {
        this.idxGenerated = true;
        this.bufIdx = gl.createBuffer();
    }
    generatePos() {
        this.posGenerated = true;
        this.bufPos = gl.createBuffer();
    }
    generateNor() {
        this.norGenerated = true;
        this.bufNor = gl.createBuffer();
    }
    generateCol() {
        this.colGenerated = true;
        this.bufCol = gl.createBuffer();
    }
    generateTranslate() {
        this.translateGenerated = true;
        this.bufTranslate = gl.createBuffer();
    }
    generateTransformCol1() {
        this.transformCol1Generated = true;
        this.bufTransformCol1 = gl.createBuffer();
    }
    generateTransformCol2() {
        this.transformCol2Generated = true;
        this.bufTransformCol2 = gl.createBuffer();
    }
    generateTransformCol3() {
        this.transformCol3Generated = true;
        this.bufTransformCol3 = gl.createBuffer();
    }
    generateTransformCol4() {
        this.transformCol4Generated = true;
        this.bufTransformCol4 = gl.createBuffer();
    }
    generateUV() {
        this.uvGenerated = true;
        this.bufUV = gl.createBuffer();
    }
    bindIdx() {
        if (this.idxGenerated) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        }
        return this.idxGenerated;
    }
    bindPos() {
        if (this.posGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        }
        return this.posGenerated;
    }
    bindNor() {
        if (this.norGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        }
        return this.norGenerated;
    }
    bindCol() {
        if (this.colGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        }
        return this.colGenerated;
    }
    bindTranslate() {
        if (this.translateGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
        }
        return this.translateGenerated;
    }
    bindTransformCol1() {
        if (this.transformCol1Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol1);
        }
        return this.transformCol1Generated;
    }
    bindTransformCol2() {
        if (this.transformCol2Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol2);
        }
        return this.transformCol2Generated;
    }
    bindTransformCol3() {
        if (this.transformCol3Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol3);
        }
        return this.transformCol3Generated;
    }
    bindTransformCol4() {
        if (this.transformCol4Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol4);
        }
        return this.transformCol4Generated;
    }
    bindUV() {
        if (this.uvGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
        }
        return this.uvGenerated;
    }
    elemCount() {
        return this.count;
    }
    drawMode() {
        return gl.TRIANGLES;
    }
    setNumInstances(num) {
        this.numInstances = num;
    }
}
;
export default Drawable;
//# sourceMappingURL=Drawable.js.map