import { vec2, vec3, quat, mat4 } from 'gl-matrix';
export default class BuildingPiece {
    constructor(height, position, buildingThickness) {
        this.height = height;
        this.position = position;
        this.rotationAngle = Math.random() * 2 * Math.PI;
        this.buildingThickness = buildingThickness;
    }
    // Return the x,y position of a random corner of the current building piece
    getRandomXYCorner() {
        let deltax = Math.random() < 0.5 ? this.buildingThickness : -this.buildingThickness;
        let deltaz = Math.random() < 0.5 ? this.buildingThickness : -this.buildingThickness;
        let ret = vec2.fromValues(this.position[0] + deltax, this.position[2] + deltaz);
        vec2.rotate(ret, ret, this.position, this.rotationAngle);
        return ret;
    }
    getTransformation() {
        let translate = vec3.fromValues(this.position[0], 0, this.position[1]);
        let rotation = quat.create();
        quat.rotateY(rotation, rotation, this.rotationAngle);
        let scale = vec3.fromValues(this.buildingThickness, this.height, this.buildingThickness);
        let transformation = mat4.create();
        mat4.fromRotationTranslationScale(transformation, rotation, translate, scale);
        return transformation;
    }
}
//# sourceMappingURL=BuildingPiece.js.map