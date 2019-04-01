import {vec3, mat4, quat} from 'gl-matrix';
import Point from '../lsystem/Point';


export default class Edge {
	p1: Point;
	p2: Point;
	isHighway: boolean;

	constructor(p1 : Point, p2: Point, isHighway: boolean) {
		// p1 will be the closer point to 0,0
		if (vec3.distance(vec3.fromValues(0, 0, 0), p1.position) < vec3.distance(vec3.fromValues(0, 0, 0), p2.position)) {
			this.p1 = p1;
			this.p2 = p2;
		} else {
			this.p2 = p1;
			this.p1 = p2;
		}
		this.isHighway = isHighway;
	}

	// Line segment intersection check, from https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
	intersectionCheck(p3: Point, p4: Point) {
		let p0_x: number = this.p1.position[0];
		let p0_y: number = this.p1.position[2];
		let p1_x: number = this.p2.position[0];
		let p1_y: number = this.p2.position[2];

		let p2_x: number = p3.position[0];
		let p2_y: number = p3.position[2];
		let p3_x: number = p4.position[0];
		let p3_y: number = p4.position[2];

		let s1_x: number = p1_x - p0_x;
		let s1_y: number = p1_y - p0_y;
		let s2_x: number = p3_x - p2_x;
		let s2_y: number = p3_y - p2_y;

		let s: number = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
		let t: number = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

		if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      let x_result: number = p0_x + (t * s1_x);
      let y_Result: number = p0_y + (t * s1_y);
      return new Point(vec3.fromValues(x_result, 0, y_Result));
    }

    return null;
	}

	split(point : Point) {
		let oldP2: Point = this.p2;
		let newEdge: Edge = new Edge(point, oldP2, this.isHighway);
		this.p2 = point;
		return newEdge;
	}
	
	midpoint() {
		let x: number = this.p1.position[0] + this.p2.position[0];
		let y: number = this.p1.position[1] + this.p2.position[1];
		let z: number = this.p1.position[2] + this.p2.position[2];
		return vec3.fromValues(x / 2, y / 2, z / 2);
	}

	getCounterClockwiseAngle(p1: vec3, p2: vec3) {
		let x1: number = p1[0];
		let y1: number = p1[2];

		let x2: number = p2[0];
		let y2: number = p2[2];

		let dot: number = x1 * x2 + y1 * y2;
		let det: number = x1 * y2 - y1 * x2;
		return -Math.atan2(det, dot);
	}

	rasterizerHelper(ycord: number) {
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
    } else {
    	let m = yslope / xslope;
      return (ycord / m) - (this.p1.position[2] / m) + this.p1.position[0];
    }
    return null;
	}
	
	// Returns the transformation matrix to instance render the current edge in the x, z plane
	getTransformation() {
		let globalUp: vec3 = vec3.fromValues(0, 0, 1);
		let direction: vec3 = vec3.fromValues(0, 0, 0);
		vec3.subtract(direction, this.p2.position, this.p1.position);
		let angleRadians: number = this.getCounterClockwiseAngle(globalUp, direction);
		let globalRotate: vec3 = vec3.fromValues(0, 1, 0);
		let rotationQuat: quat = quat.create();
		quat.setAxisAngle(rotationQuat, globalRotate, angleRadians);

		let translate = this.midpoint();

		let scaleX: number = this.isHighway ? 15 : 5;
		let scaleY: number = 1;
		let scaleZ: number = vec3.length(direction);
		let scaleVector: vec3 = vec3.fromValues(scaleX, scaleY, scaleZ);

		let transformationMat: mat4 = mat4.create();
	  mat4.fromRotationTranslationScale(transformationMat, rotationQuat, translate, scaleVector);
	  return transformationMat;
	}
}