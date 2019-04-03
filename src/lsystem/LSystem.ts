import {vec3, mat4, quat} from 'gl-matrix';
import Point from '../lsystem/Point';
import Edge from '../lsystem/Edge';
import TextureUtil from '../lsystem/TextureUtil';
import Turtle from '../lsystem/Turtle';
import HighwayTurtle from '../lsystem/HighwayTurtle';


export default class LSystem {
	textureUtil: TextureUtil;
	points: Point[];
	edges: Edge[];

	constructor(textureData: Uint8Array) {
		this.textureUtil = new TextureUtil(textureData);
		this.points = [];
		this.edges = [];
	}

	// Simulate the road generation L-System once based on number of iterations
	simulate(iterations: number, gridSize: number, popThreshold: number) {
		console.log("Starting L-System");

		this.points = [];
		this.edges = [];

		// Turtle stack to hold highway turtles and road turtles
		let turtleStack: any[] = [];

		// Start Highway Turtle L-System
		let startingPoint: Point = new Point(vec3.fromValues(560, 0, 1790));
		let forward: vec3 = vec3.fromValues(0, 0, 1);
		let right: vec3 = vec3.fromValues(1, 0, 0);
		let up: vec3 = vec3.fromValues(0, 1, 0);
		let q: quat = quat.fromValues(0, 0, 0, 1);

		let target1: Point = new Point(vec3.fromValues(0, 0, 950));
		let highwayTurtle1: HighwayTurtle = new HighwayTurtle(startingPoint, forward, up, right, q,
																													target1, true, false, false,
																													this.textureUtil, this.points, this.edges,
																													iterations, gridSize * 10, popThreshold);
		highwayTurtle1.rotateByUpAxis(-45);	

		let target2: Point = new Point(vec3.fromValues(850, 0, 2000));
		let highwayTurtle2: HighwayTurtle = new HighwayTurtle(startingPoint, forward, up, right, q,
																													target2, false, false, false,
																													this.textureUtil, this.points, this.edges,
																													iterations, gridSize * 10, popThreshold);

		turtleStack.push(highwayTurtle1);
		turtleStack.push(highwayTurtle2);

		// Run BFS on the turtle grid network
		while (turtleStack.length != 0) {
			let currTurtle = turtleStack.shift();
			let expandedTurtles = currTurtle.simulate();
			for (let i: number = 0; i < expandedTurtles.length; i++) {
				turtleStack.push(expandedTurtles[i]);
			}
		}
	}

	// Returns the VBO Data from the current iteration of the LSystem
	// Data is in object format
	getVBOData() {
  	let col1Array: number[] = [];
  	let col2Array: number[] = [];
  	let col3Array: number[] = [];
  	let col4Array: number[] = [];
  	let colorsArray: number[] = [];

		for (let i: number = 0; i < this.edges.length; i++) {
			let currEdge: Edge = this.edges[i];
			let currTransform: mat4 = currEdge.getTransformation();

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

      colorsArray.push(79 / 500);
      colorsArray.push(109 / 500);
      colorsArray.push(122 / 500);
      colorsArray.push(1);
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