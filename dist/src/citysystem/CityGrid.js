import { vec2 } from 'gl-matrix';
import TextureUtil from '../lsystem/TextureUtil';
export default class CityGrid {
    constructor(textureData) {
        this.textureUtil = new TextureUtil(textureData);
        this.highwayDelta = 10;
        this.roadDelta = 4;
        this.cityDelta = 10;
    }
    resetGrid() {
        this.grid = [];
        this.buildingPoints = [];
        for (let i = 0; i < 2000; i++) {
            let row = [];
            for (let j = 0; j < 2000; j++) {
                row.push(0);
            }
            this.grid.push(row);
        }
    }
    validBuildingSpot(x, y, popThreshold) {
        if (this.textureUtil.getPopulation(x, y) < popThreshold) {
            return false;
        }
        // Search 5 x 5 box around x, y
        for (let i = x - this.cityDelta; i < x + this.cityDelta + 1; i++) {
            for (let j = y - this.cityDelta; j < y + this.cityDelta + 1; j++) {
                if (i > -1 && i < 2000 && j > -1 && j < 2000) {
                    if (this.grid[i][j] != 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    // Returns a grid of booleans of size 2000, 2000 where true represents 
    // that a road or water exists at the position in world space.
    generateGrid(edges, popThreshold) {
        this.resetGrid();
        // Edge Rasterization
        for (let y = 0; y < 2000; y++) {
            // Edge Intersection Test
            for (let edgeNum = 0; edgeNum < edges.length; edgeNum++) {
                let currentEdge = edges[edgeNum];
                let result = currentEdge.rasterizerHelper(y);
                if (result) {
                    let xOrg = Math.floor(result);
                    let delta = currentEdge.isHighway ? this.highwayDelta : this.roadDelta;
                    for (let deltaX = -delta; deltaX < delta + 1; deltaX++) {
                        let x = xOrg + deltaX;
                        if (x >= 0 && x < 2000) {
                            this.grid[x][y] = 1;
                        }
                    }
                }
            }
        }
        // Water Rasterization
        for (let i = 0; i < 2000; i++) {
            for (let j = 0; j < 2000; j++) {
                if (this.textureUtil.getWater(i, j) == 0) {
                    this.grid[i][j] = 2;
                }
            }
        }
        // Randomly generate 1000 buildings
        let counter = 0;
        while (counter < 1000) {
            let x = Math.floor(Math.random() * 2000);
            let y = Math.floor(Math.random() * 2000);
            if (this.validBuildingSpot(x, y, popThreshold)) {
                for (let i = x - this.cityDelta; i < x + this.cityDelta + 1; i++) {
                    for (let j = y - this.cityDelta; j < y + this.cityDelta + 1; j++) {
                        if (i > -1 && i < 2000 && j > -1 && j < 2000) {
                            this.grid[i][j] = 3;
                        }
                    }
                }
                this.buildingPoints.push(vec2.fromValues(x, y));
                counter = counter + 1;
            }
        }
        return this.grid;
    }
    getVBODataRasterization() {
        let col1Array = [];
        let col2Array = [];
        let col3Array = [];
        let col4Array = [];
        let colorsArray = [];
        for (let i = 0; i < 2000; i++) {
            for (let j = 0; j < 2000; j++) {
                let gridVal = this.grid[i][j];
                if (gridVal != 0) {
                    col1Array.push(1);
                    col1Array.push(0);
                    col1Array.push(0);
                    col1Array.push(0);
                    col2Array.push(0);
                    col2Array.push(1);
                    col2Array.push(0);
                    col2Array.push(0);
                    col3Array.push(0);
                    col3Array.push(0);
                    col3Array.push(1);
                    col3Array.push(0);
                    col4Array.push(i);
                    col4Array.push(0);
                    col4Array.push(j);
                    col4Array.push(1);
                    if (gridVal == 1) {
                        // road case
                        colorsArray.push(0);
                        colorsArray.push(0);
                        colorsArray.push(0);
                        colorsArray.push(1);
                    }
                    if (gridVal == 2) {
                        // water case
                        colorsArray.push(0);
                        colorsArray.push(0);
                        colorsArray.push(1);
                        colorsArray.push(1);
                    }
                    if (gridVal == 3) {
                        // building case
                        colorsArray.push(1);
                        colorsArray.push(0);
                        colorsArray.push(0);
                        colorsArray.push(1);
                    }
                }
            }
        }
        let col1 = new Float32Array(col1Array);
        let col2 = new Float32Array(col2Array);
        let col3 = new Float32Array(col3Array);
        let col4 = new Float32Array(col4Array);
        let colors = new Float32Array(colorsArray);
        let ret = {};
        ret.col1 = col1;
        ret.col2 = col2;
        ret.col3 = col3;
        ret.col4 = col4;
        ret.colors = colors;
        return ret;
    }
    getVBODataBuildings() {
        let col1Array = [];
        let col2Array = [];
        let col3Array = [];
        let col4Array = [];
        let colorsArray = [];
        for (let i = 0; i < this.buildingPoints.length; i++) {
            let pos = this.buildingPoints[i];
            let populationDensity = this.textureUtil.getPopulation(pos[0], pos[1]);
            let height = populationDensity * populationDensity * populationDensity * 50;
            col1Array.push(25);
            col1Array.push(0);
            col1Array.push(0);
            col1Array.push(0);
            col2Array.push(0);
            col2Array.push(height);
            col2Array.push(0);
            col2Array.push(0);
            col3Array.push(0);
            col3Array.push(0);
            col3Array.push(25);
            col3Array.push(0);
            col4Array.push(pos[0]);
            col4Array.push(0);
            col4Array.push(pos[1]);
            col4Array.push(1);
            colorsArray.push(0.8);
            colorsArray.push(0.8);
            colorsArray.push(0.8);
            colorsArray.push(1.0);
        }
        let col1 = new Float32Array(col1Array);
        let col2 = new Float32Array(col2Array);
        let col3 = new Float32Array(col3Array);
        let col4 = new Float32Array(col4Array);
        let colors = new Float32Array(colorsArray);
        let ret = {};
        ret.col1 = col1;
        ret.col2 = col2;
        ret.col3 = col3;
        ret.col4 = col4;
        ret.colors = colors;
        return ret;
    }
}
//# sourceMappingURL=CityGrid.js.map