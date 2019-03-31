import {vec3} from 'gl-matrix';


export default class Point {
	position: vec3 = vec3.create();

	constructor(pos: vec3) {
		this.position = pos;
	}

	withinCircle(center: vec3, radius: number) {
		return vec3.distance(center, this.position) < radius;
	}
}