import {vec3} from 'gl-matrix';
import Point from '../lsystem/Point';
import Edge from '../lsystem/Edge';
import TextureUtil from '../lsystem/TextureUtil';

export default class CityGrid {
	textureUtil: TextureUtil;
	grid: boolean[][];
	highwayDelta: number;
	roadDelta: number;

	constructor(textureData: Uint8Array) {
		this.textureUtil = new TextureUtil(textureData);
		this.highwayDelta = 10;
		this.roadDelta = 4;
	}

	resetGrid() {
		this.grid = [];
		for (let i: number = 0; i < 2000; i++) {
			let row: boolean[] = [];
			for (let j: number = 0; j < 2000; j++) {
				row.push(false);
			}
			this.grid.push(row);
		}
	}

	// Returns a grid of booleans of size 2000, 2000 where true represents 
	// that a road or water exists at the position in world space.
	generateGrid(edges: Edge[]) {
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
							this.grid[x][y] = true;
						}
					}

				}
			}
		}

		// Water Rasterization
		for (let i: number = 0; i < 2000; i++) {
			for (let j: number = 0; j < 2000; j++) {
				if (this.textureUtil.getWater(i, j) == 0) {
					this.grid[i][j] = true;
				}
			}
		}

		return this.grid;
	}
}