import { vec3 } from 'gl-matrix';
export default class Point {
    constructor(pos) {
        this.position = vec3.create();
        this.position = pos;
    }
    withinCircle(center, radius) {
        return vec3.distance(center, this.position) < radius;
    }
}
//# sourceMappingURL=Point.js.map