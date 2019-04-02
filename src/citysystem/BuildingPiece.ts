import {vec2, vec3, quat, mat4} from 'gl-matrix';

export default class BuildingPiece {
	// Height to handle the 'extruding down' of the building piece
	height: number;

	// position of the x, z center of the building piece
	position: vec2;

	// a random y rotation angle applied to the current building piece
	rotationAngle: number;

	// The x, z scale of the building piece
	buildingThickness: number;

	constructor(height: number, position: vec2, buildingThickness: number) {
		this.height = height;
		this.position = position;
		this.rotationAngle = Math.random() * 2 * Math.PI;

		this.buildingThickness = buildingThickness;
	}

	// Return the x,y position of a random corner of the current building piece
	getRandomXYCorner() {
		let deltax = Math.random() < 0.5 ? this.buildingThickness / 2 : -1.0 * this.buildingThickness / 2;
		let deltaz = Math.random() < 0.5 ? this.buildingThickness / 2 : -1.0 * this.buildingThickness / 2;
		let pos: vec3 = vec3.fromValues(this.position[0] + deltax, 0, this.position[1] + deltaz);
		vec3.rotateY(pos, pos, vec3.fromValues(this.position[0], 0, this.position[1]), this.rotationAngle);

		return vec2.fromValues(pos[0], pos[2]);
	}

	getTransformation() {
		let translate: vec3 = vec3.fromValues(this.position[0], 0, this.position[1]);
		let rotation: quat = quat.create();
		quat.rotateY(rotation, rotation, this.rotationAngle);
		let scale: vec3 = vec3.fromValues(this.buildingThickness, this.height, this.buildingThickness);

		let transformation: mat4 = mat4.create();
		mat4.fromRotationTranslationScale(transformation, rotation, translate, scale);

		return transformation;
	}
}