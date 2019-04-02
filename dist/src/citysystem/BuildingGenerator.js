import { vec2, mat4 } from 'gl-matrix';
import TextureUtil from '../lsystem/TextureUtil';
import BuildingPiece from '../citysystem/BuildingPiece';
export default class BuildingGenerator {
    constructor(textureData) {
        this.textureUtil = new TextureUtil(textureData);
        this.buildingThickness = 25;
        this.buildingHeight = 50;
        this.deltaHeight = 10;
        this.extrudeRate = 0.2;
    }
    getMatrix(translate, scale, rotate, origin) {
        let ret = mat4.create();
        mat4.fromRotationTranslationScaleOrigin(ret, rotate, translate, scale, origin);
        return ret;
    }
    // Returns VBO data for a random building of provided x, y point
    generateBuilding(x, y) {
        let populationDensity = this.textureUtil.getPopulation(x, y);
        let currentHeight = populationDensity * populationDensity * populationDensity * this.buildingHeight;
        let buildingPieces = [];
        buildingPieces.push(new BuildingPiece(currentHeight, vec2.fromValues(x, y), this.buildingThickness));
        while (currentHeight > 0) {
            // Extrudes a new random piece from a random building piece with a small probability
            if (Math.random() < this.extrudeRate) {
                let index = ;
            }
        }
    }
}
//# sourceMappingURL=BuildingGenerator.js.map