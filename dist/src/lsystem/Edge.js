import { vec3, mat4, quat } from 'gl-matrix';
import Point from '../lsystem/Point';
export default class Edge {
    constructor(p1, p2, isHighway) {
        // p1 will be the closer point to 0,0
        if (vec3.distance(vec3.fromValues(0, 0, 0), p1.position) < vec3.distance(vec3.fromValues(0, 0, 0), p2.position)) {
            this.p1 = p1;
            this.p2 = p2;
        }
        else {
            this.p2 = p1;
            this.p1 = p2;
        }
        this.isHighway = isHighway;
    }
    // Line segment intersection check, from https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    intersectionCheck(p3, p4) {
        let p0_x = this.p1.position[0];
        let p0_y = this.p1.position[2];
        let p1_x = this.p2.position[0];
        let p1_y = this.p2.position[2];
        let p2_x = p3.position[0];
        let p2_y = p3.position[2];
        let p3_x = p4.position[0];
        let p3_y = p4.position[2];
        let s1_x = p1_x - p0_x;
        let s1_y = p1_y - p0_y;
        let s2_x = p3_x - p2_x;
        let s2_y = p3_y - p2_y;
        let s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        let t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            let x_result = p0_x + (t * s1_x);
            let y_Result = p0_y + (t * s1_y);
            return new Point(vec3.fromValues(x_result, 0, y_Result));
        }
        return null;
    }
    split(point) {
        let oldP2 = this.p2;
        let newEdge = new Edge(point, oldP2, this.isHighway);
        this.p2 = point;
        return newEdge;
    }
    midpoint() {
        let x = this.p1.position[0] + this.p2.position[0];
        let y = this.p1.position[1] + this.p2.position[1];
        let z = this.p1.position[2] + this.p2.position[2];
        return vec3.fromValues(x / 2, y / 2, z / 2);
    }
    getCounterClockwiseAngle(p1, p2) {
        let x1 = p1[0];
        let y1 = p1[2];
        let x2 = p2[0];
        let y2 = p2[2];
        let dot = x1 * x2 + y1 * y2;
        let det = x1 * y2 - y1 * x2;
        return -Math.atan2(det, dot);
    }
    rasterizerHelper(ycord) {
        let ymax = Math.max(this.p2.position[2], this.p1.position[2]);
        let ymin = Math.min(this.p2.position[2], this.p1.position[2]);
        if (ymax < ycord || ymin > ycord) {
            return false;
        }
        let yslope = this.p2.position[2] - this.p1.position[2];
        let xslope = this.p2.position[0] - this.p1.position[0];
        if (xslope == 0) {
            return this.p1.position[0];
        }
        if (yslope == 0) {
            return this.midpoint();
        }
        else {
            let m = yslope / xslope;
            return (ycord / m) - (this.p1.position[2] / m) + this.p1.position[0];
        }
        return null;
    }
    // Returns the transformation matrix to instance render the current edge in the x, z plane
    getTransformation() {
        let globalUp = vec3.fromValues(0, 0, 1);
        let direction = vec3.fromValues(0, 0, 0);
        vec3.subtract(direction, this.p2.position, this.p1.position);
        let angleRadians = this.getCounterClockwiseAngle(globalUp, direction);
        let globalRotate = vec3.fromValues(0, 1, 0);
        let rotationQuat = quat.create();
        quat.setAxisAngle(rotationQuat, globalRotate, angleRadians);
        let translate = this.midpoint();
        let scaleX = this.isHighway ? 15 : 5;
        let scaleY = 1;
        let scaleZ = vec3.length(direction);
        let scaleVector = vec3.fromValues(scaleX, scaleY, scaleZ);
        let transformationMat = mat4.create();
        mat4.fromRotationTranslationScale(transformationMat, rotationQuat, translate, scaleVector);
        return transformationMat;
    }
}
//# sourceMappingURL=Edge.js.map