import { vec3, mat4, quat } from 'gl-matrix';
import Point from '../lsystem/Point';
import Edge from '../lsystem/Edge';
export default class Turtle {
    constructor(pos, forward, up, right, q, rd, textureUtil, points, edges, iterations, gridSize, popThreshold) {
        this.forward = vec3.create();
        this.up = vec3.create();
        this.right = vec3.create();
        this.quaternion = quat.create();
        this.recursionDepth = 0;
        this.position = pos;
        this.forward = forward;
        this.up = up;
        this.right = right;
        this.quaternion = q;
        this.recursionDepth = rd;
        this.textureUtil = textureUtil;
        this.points = points;
        this.edges = edges;
        this.iterations = iterations;
        this.gridSize = gridSize;
        this.popThreshold = popThreshold;
    }
    rotateByUpAxis(degrees) {
        let q = quat.create();
        quat.setAxisAngle(q, this.up, degrees * Math.PI / 180.0);
        let rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, q);
        vec3.transformMat4(this.forward, this.forward, rotationMatrix);
        vec3.normalize(this.forward, this.forward);
        vec3.transformMat4(this.right, this.right, rotationMatrix);
        vec3.normalize(this.right, this.right);
        // Save the current rotation in our turtle's quaternion
        quat.rotationTo(this.quaternion, vec3.fromValues(0, 1, 0), this.forward);
    }
    moveForward(length) {
        // move the turtle length 1 forward and returns the transformation
        let translation = vec3.fromValues(this.forward[0] * length, this.forward[1] * length, this.forward[2] * length);
        vec3.add(this.position.position, this.position.position, translation);
    }
    // Checks if the local turtle satisfies local constraints (recursion limit, snap, water)
    localConstraints(expandedTurtle) {
        // Recursion Limit Check
        if (expandedTurtle.recursionDepth > this.iterations) {
            return null;
        }
        // Out of Bounds Check
        if (this.position.position[0] < 0 || this.position.position[0] > 2000 ||
            this.position.position[2] < 0 || this.position.position[2] > 2000) {
            return null;
        }
        // Line Segment Intersection Check
        let feeler = vec3.create();
        let translation = vec3.fromValues(expandedTurtle.forward[0], expandedTurtle.forward[1], expandedTurtle.forward[2]);
        vec3.add(feeler, this.position.position, translation);
        for (let i = 0; i < this.edges.length; i++) {
            let currEdge = this.edges[i];
            let possibleIntersection = currEdge.intersectionCheck(new Point(feeler), expandedTurtle.position);
            if (possibleIntersection) {
                // Create new truncated line segment
                expandedTurtle.position = possibleIntersection;
                let newEdge = new Edge(this.position, expandedTurtle.position, false);
                this.edges.push(newEdge);
                // Split old Road to allow for new intersection
                let splitEdge = currEdge.split(expandedTurtle.position);
                this.edges.push(splitEdge);
                this.points.push(possibleIntersection);
                return null;
            }
        }
        // Point Snap Check
        for (let i = 0; i < this.points.length; i++) {
            let currPoint = this.points[i];
            if (expandedTurtle.position.withinCircle(currPoint.position, 0.5 * this.gridSize)) {
                expandedTurtle.position = currPoint;
                let newEdge = new Edge(this.position, expandedTurtle.position, false);
                this.edges.push(newEdge);
                return null;
            }
        }
        // Water Check
        if (this.textureUtil.getWater(expandedTurtle.position.position[0], expandedTurtle.position.position[2]) == 0) {
            return null;
        }
        // Density Check
        if (this.textureUtil.getPopulation(expandedTurtle.position.position[0], expandedTurtle.position.position[2]) < this.popThreshold) {
            return null;
        }
        // Reach here if we create a new branching turtle
        this.points.push(expandedTurtle.position);
        let newEdge = new Edge(this.position, expandedTurtle.position, false);
        this.edges.push(newEdge);
        return expandedTurtle;
    }
    // Creates a copy turtle instance to add to the turtle stack
    createTurtleInstance() {
        let newPos = vec3.create();
        vec3.copy(newPos, this.position.position);
        let newPoint = new Point(newPos);
        let newFor = vec3.create();
        vec3.copy(newFor, this.forward);
        let newUp = vec3.create();
        vec3.copy(newUp, this.up);
        let newRight = vec3.create();
        vec3.copy(newRight, this.right);
        let newQuat = quat.create();
        quat.copy(newQuat, this.quaternion);
        return new Turtle(newPoint, newFor, newUp, newRight, newQuat, this.recursionDepth + 1, this.textureUtil, this.points, this.edges, this.iterations, this.gridSize, this.popThreshold);
    }
    // Simple Manhattan Expansion Rule, expand 3 direction: forward, -right, + right
    expansionRule() {
        let expansionTurtles = [];
        let movementLength = this.gridSize;
        let turtleUp = this.createTurtleInstance();
        turtleUp.moveForward(movementLength);
        expansionTurtles.push(turtleUp);
        let turtleDown = this.createTurtleInstance();
        turtleDown.rotateByUpAxis(180);
        turtleDown.moveForward(movementLength);
        expansionTurtles.push(turtleDown);
        let turtleLeft = this.createTurtleInstance();
        turtleLeft.rotateByUpAxis(-90);
        turtleLeft.moveForward(movementLength);
        expansionTurtles.push(turtleLeft);
        let turtleRight = this.createTurtleInstance();
        turtleRight.rotateByUpAxis(90);
        turtleRight.moveForward(movementLength);
        expansionTurtles.push(turtleRight);
        return expansionTurtles;
    }
    // Returns a list of the next turtles that spawn from the current turtle
    simulate() {
        let possibleExpansionTurtles = this.expansionRule();
        let validExpansionTurtles = [];
        for (let i = 0; i < possibleExpansionTurtles.length; i++) {
            let currExpansionTurtle = this.localConstraints(possibleExpansionTurtles[i]);
            if (currExpansionTurtle) {
                validExpansionTurtles.push(currExpansionTurtle);
            }
        }
        return validExpansionTurtles;
    }
}
//# sourceMappingURL=Turtle.js.map