import {vec2, vec3, mat4} from 'gl-matrix';
import Point from '../lsystem/Point';
import Edge from '../lsystem/Edge';
import TextureUtil from '../lsystem/TextureUtil';
import BuildingGenerator from '../citysystem/BuildingGenerator';

export default class CityGrid {
	textureUtil: TextureUtil;
	buildingGenerator: BuildingGenerator;

	// Grid is a number array, 0 = nothing, 1 = road, 2 = water, 3 = building center
	grid: number[][];
	buildingPoints: vec2[];

	highwayDelta: number;
	roadDelta: number;
	cityDelta: number;

	constructor(textureData: Uint8Array) {
		this.textureUtil = new TextureUtil(textureData);
		this.buildingGenerator = new BuildingGenerator(textureData);
		this.highwayDelta = 10;
		this.roadDelta = 4;
		this.cityDelta = 10;
	}

	resetGrid() {
		this.grid = [];
		this.buildingPoints = [];
		
		for (let i: number = 0; i < 2000; i++) {
			let row: number[] = [];
			for (let j: number = 0; j < 2000; j++) {
				row.push(0);
			}
			this.grid.push(row);
		}
	}

	validBuildingSpot(x: number, y: number, popThreshold: number) {
		if (this.textureUtil.getPopulation(x, y) < popThreshold) {
			return false;
		}

		// Search 5 x 5 box around x, y
		for (let i: number = x - this.cityDelta; i < x + this.cityDelta + 1; i++) {
			for (let j: number = y - this.cityDelta; j < y + this.cityDelta + 1; j++) {
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
	generateGrid(edges: Edge[], popThreshold: number) {
		this.resetGrid();

		// Edge Rasterization
		for (let y: number = 0; y < 2000; y++) {
			// Edge Intersection Test
			for (let edgeNum: number = 0; edgeNum < edges.length; edgeNum++) {
				let currentEdge: Edge = edges[edgeNum];
				let result: any = currentEdge.rasterizerHelper(y);

				if (result) {
					let xOrg = Math.floor(result);
					let delta: number = currentEdge.isHighway ? this.highwayDelta : this.roadDelta;

					for (let deltaX = -delta; deltaX < delta + 1; deltaX++) {
						let x: number = xOrg + deltaX;
						if (x >= 0 && x < 2000) {
							this.grid[x][y] = 1;
						}
					}
				}
			}
		}

		// Water Rasterization
		for (let i: number = 0; i < 2000; i++) {
			for (let j: number = 0; j < 2000; j++) {
				if (this.textureUtil.getWater(i, j) == 0) {
					this.grid[i][j] = 2;
				}
			}
		}

		// Randomly generate 1000 buildings
		let counter: number = 0;
		while (counter < 1000) {
			let x = Math.floor(Math.random() * 2000);
			let y = Math.floor(Math.random() * 2000);

			if (this.validBuildingSpot(x, y, popThreshold)) {
				for (let i: number = x - this.cityDelta; i < x + this.cityDelta + 1; i++) {
					for (let j: number = y - this.cityDelta; j < y + this.cityDelta + 1; j++) {
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
		let col1Array: number[] = [];
	  let col2Array: number[] = [];
	  let col3Array: number[] = [];
	  let col4Array: number[] = [];
	  let colorsArray: number[] = [];

	  for (let i: number = 0; i < 2000; i++) {
	    for (let j: number = 0; j < 2000; j++) {
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

	  let col1: Float32Array = new Float32Array(col1Array);
	  let col2: Float32Array = new Float32Array(col2Array);
	  let col3: Float32Array = new Float32Array(col3Array);
	  let col4: Float32Array = new Float32Array(col4Array);
	  let colors: Float32Array = new Float32Array(colorsArray);

	  let ret: any = {};
  	ret.col1 = col1;
  	ret.col2 = col2;
  	ret.col3 = col3;
  	ret.col4 = col4;
  	ret.colors = colors;

  	return ret;
	}

	getVBODataBuildings() {
	  let col1Array: number[] = [];
	  let col2Array: number[] = [];
	  let col3Array: number[] = [];
	  let col4Array: number[] = [];
	  let colorsArray: number[] = [];

	  for (let i: number = 0; i < this.buildingPoints.length; i++) {
	  	let pos: vec2 = this.buildingPoints[i];
	  	let transformations: mat4[] = this.buildingGenerator.generateBuilding(pos[0], pos[1]);

	  	for (let j: number = 0; j < transformations.length; j++) {
	  		let currTransform: mat4 = transformations[j];

		  	col1Array.push(currTransform[0]);
	      col1Array.push(currTransform[1]);
	      col1Array.push(currTransform[2]);
	      col1Array.push(currTransform[3]);

	      col2Array.push(currTransform[4]);
	      col2Array.push(currTransform[5]);
	      col2Array.push(currTransform[6]);
	      col2Array.push(currTransform[7]);

	      col3Array.push(currTransform[8]);
	      col3Array.push(currTransform[9]);
	      col3Array.push(currTransform[10]);
	      col3Array.push(currTransform[11]);

	      col4Array.push(currTransform[12]);
	      col4Array.push(currTransform[13]);
	      col4Array.push(currTransform[14]);
	      col4Array.push(currTransform[15]);

	     	colorsArray.push(130 / 255);
		    colorsArray.push(163 / 255);
		    colorsArray.push(161 / 255);
		    colorsArray.push(1.0);
	  	}
	  }

	  let col1: Float32Array = new Float32Array(col1Array);
	  let col2: Float32Array = new Float32Array(col2Array);
	  let col3: Float32Array = new Float32Array(col3Array);
	  let col4: Float32Array = new Float32Array(col4Array);
	  let colors: Float32Array = new Float32Array(colorsArray);

	  let ret: any = {};
  	ret.col1 = col1;
  	ret.col2 = col2;
  	ret.col3 = col3;
  	ret.col4 = col4;
  	ret.colors = colors;

  	return ret;
	}
}