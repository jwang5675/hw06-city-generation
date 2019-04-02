import {vec2, vec3, quat, mat4} from 'gl-matrix';
import TextureUtil from '../lsystem/TextureUtil';
import BuildingPiece from '../citysystem/BuildingPiece';

export default class BuildingGenerator {
	textureUtil: TextureUtil;
	buildingThickness: number;
	buildingHeight: number;
	deltaHeight: number;
	extrudeRate: number;

	constructor(textureData: Uint8Array) {
		this.textureUtil = new TextureUtil(textureData);
		this.buildingThickness = 25;
		this.buildingHeight = 50;
		this.deltaHeight = 5;
		this.extrudeRate = 0.2;
	}

	getMatrix(translate: vec3, scale: vec3, rotate: quat, origin: vec3) {
		let ret: mat4 = mat4.create();
		mat4.fromRotationTranslationScaleOrigin(ret, rotate, translate, scale, origin);
		return ret;
	}

	// Returns mat4 transformations representing the building pieces
	generateBuilding(x: number, y: number) {
		let populationDensity = this.textureUtil.getPopulation(x, y);
		let currentHeight = populationDensity * populationDensity * populationDensity * this.buildingHeight;

		// Generate the building pieces
		let buildingPieces: BuildingPiece[] = [];
		buildingPieces.push(new BuildingPiece(currentHeight, vec2.fromValues(x, y), this.buildingThickness));

		currentHeight = currentHeight - this.deltaHeight;

		while (currentHeight > 0) {
			// Extrudes a new random piece from a random building piece with a small probability
			if (Math.random() < this.extrudeRate) {
				let index: number = Math.floor(Math.random() * buildingPieces.length);
				let corner: vec2 = buildingPieces[index].getRandomXYCorner();
				buildingPieces.push(new BuildingPiece(currentHeight, corner, this.buildingThickness / 1.5));
			}

			currentHeight = currentHeight - this.deltaHeight;
		}

		// Take the building pieces and generate vbo data
		let transformations: mat4[] = [];
		for (let i: number = 0; i < buildingPieces.length; i++) {
			transformations.push(buildingPieces[i].getTransformation());
		}

		return transformations;
	}
}