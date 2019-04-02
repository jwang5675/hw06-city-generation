import { vec3, mat4, quat } from 'gl-matrix';
import Point from '../lsystem/Point';
import Edge from '../lsystem/Edge';
import Turtle from '../lsystem/Turtle';
export default class HighwayTurtle {
    constructor(point, forward, up, right, q, target, rotationFlag, waterFlag, expandFlag, textureUtil, points, edges, iterations, gridSize, popThreshold) {
        this.forward = vec3.create();
        this.up = vec3.create();
        this.right = vec3.create();
        this.quaternion = quat.create();
        this.point = point;
        this.forward = vec3.fromValues(forward[0], forward[1], forward[2]);
        this.up = vec3.fromValues(up[0], up[1], up[2]);
        this.right = vec3.fromValues(right[0], right[1], right[2]);
        this.quaternion = quat.fromValues(q[0], q[1], q[2], q[3]);
        this.target = target;
        this.rotationFlag = rotationFlag;
        this.waterFlag = waterFlag;
        this.expandFlag = expandFlag;
        this.textureUtil = textureUtil;
        this.points = points;
        this.edges = edges;
        this.iterations = iterations;
        this.gridSize = gridSize;
        this.popThreshold = popThreshold;
        if (this.waterFlag) {
            let direction = vec3.create();
            vec3.subtract(direction, this.target.position, this.point.position);
            vec3.normalize(direction, direction);
            let angle = this.getCounterClockwiseAngle(this.forward, direction);
            this.rotateByUpAxis(angle * 180 / Math.PI);
        }
    }
    getCounterClockwiseAngle(p1, p2) {
        let x1 = p1[0];
        let y1 = p1[2];
        let x2 = p2[0];
        let y2 = p2[2];
        let dot = x1 * x2 + y1 * y2;
        let det = x1 * y2 - y1 * x2;
        return -Math.atan2(det, dot);
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
    // Simple Local Constraint, check if out of bounds or in water
    localConstraints(turtle) {
        // Check if turtle is out of bounds
        if (this.point.position[0] < 0 || this.point.position[0] > 2000 ||
            this.point.position[2] < 0 || this.point.position[2] > 2000) {
            return null;
        }
        // check if our turtle is near our target, end search if we reach it
        if (this.target.withinCircle(turtle.point.position, this.gridSize)) {
            let newEdge = new Edge(this.point, this.target, true);
            this.points.push(this.target);
            this.edges.push(newEdge);
            this.expandFlag = true;
            return null;
        }
        // Check if the current turtle can walk on water
        if (this.waterFlag) {
            return turtle;
        }
        let x = turtle.point.position[0];
        let y = turtle.point.position[2];
        // Rotate for map bound at most 360 degrees;
        let angle = this.rotationFlag ? -10 * Math.PI / 180 : 10 * Math.PI / 180;
        let maxSteps = 36;
        let counter = 0;
        // Check for water itersection, rotate the point until it does not hit water
        while (this.textureUtil.getWater(x, y) == 0) {
            vec3.rotateY(turtle.point.position, turtle.point.position, this.point.position, angle);
            turtle.rotateByUpAxis(angle);
            x = turtle.point.position[0];
            y = turtle.point.position[2];
            counter = counter + 1;
            if (counter == maxSteps) {
                return null;
            }
        }
        return turtle;
    }
    // Simple Global Constraint by population density
    globalGoals(expandedPoint) {
        let xpos = expandedPoint.position[0] + this.gridSize * this.forward[0];
        let ypos = expandedPoint.position[1] + this.gridSize * this.forward[1];
        let zpos = expandedPoint.position[2] + this.gridSize * this.forward[2];
        expandedPoint.position = vec3.fromValues(xpos, ypos, zpos);
    }
    // Simple expansion rule, expands the turtle by moving forward
    expansionRule() {
        let expansionTurtles = [];
        let x = this.point.position[0];
        let y = this.point.position[1];
        let z = this.point.position[2];
        let expandedPoint = new Point(vec3.fromValues(x, y, z));
        this.globalGoals(expandedPoint);
        expansionTurtles.push(this.createNextHighwayTurtle(expandedPoint));
        return expansionTurtles;
    }
    expansionRuleFirstExpansion(expansionTurtles) {
        if (this.expandFlag && !this.waterFlag) {
            if (!this.rotationFlag) {
                let cityCenter0 = new Point(vec3.fromValues(420, 0, 1890));
                let cityCenter1 = new Point(vec3.fromValues(380, 0, 2000));
                expansionTurtles.push(this.createNextHighwayTurtleNewTarget(cityCenter0, cityCenter1));
                let cityCenter2 = new Point(vec3.fromValues(850, 0, 1600));
                expansionTurtles.push(this.createNextHighwayTurtleNewTarget(cityCenter0, cityCenter2));
                let cityCenter3 = new Point(vec3.fromValues(740, 0, 800));
                expansionTurtles.push(this.createNextHighwayTurtleNewTarget(cityCenter2, cityCenter3));
                let cityCenter4 = new Point(vec3.fromValues(2000, 0, 80));
                expansionTurtles.push(this.createNextHighwayTurtleNewTarget(cityCenter3, cityCenter4));
                let cityCenter5 = new Point(vec3.fromValues(0, 0, 380));
                expansionTurtles.push(this.createNextHighwayTurtleNewTarget(cityCenter3, cityCenter5));
            }
        }
    }
    createNextHighwayTurtle(newPoint) {
        let newFor = vec3.create();
        vec3.copy(newFor, this.forward);
        let newUp = vec3.create();
        vec3.copy(newUp, this.up);
        let newRight = vec3.create();
        vec3.copy(newRight, this.right);
        let newQuat = quat.create();
        quat.copy(newQuat, this.quaternion);
        return new HighwayTurtle(newPoint, newFor, newUp, newRight, newQuat, this.target, this.rotationFlag, this.waterFlag, false, this.textureUtil, this.points, this.edges, this.iterations, this.gridSize, this.popThreshold);
    }
    createNextHighwayTurtleNewTarget(newPoint, newTarget) {
        let newFor = vec3.create();
        vec3.copy(newFor, this.forward);
        let newUp = vec3.create();
        vec3.copy(newUp, this.up);
        let newRight = vec3.create();
        vec3.copy(newRight, this.right);
        let newQuat = quat.create();
        quat.copy(newQuat, this.quaternion);
        return new HighwayTurtle(newPoint, newFor, newUp, newRight, newQuat, newTarget, this.rotationFlag, true, false, this.textureUtil, this.points, this.edges, this.iterations, this.gridSize, this.popThreshold);
    }
    roadTurtleConstraints(newOrigin, expandedTurtle) {
        // Line Segment Check
        let feeler = vec3.create();
        let translation = vec3.fromValues(expandedTurtle.forward[0], expandedTurtle.forward[1], expandedTurtle.forward[2]);
        vec3.add(feeler, newOrigin.position, translation);
        for (let i = 0; i < this.edges.length; i++) {
            let currEdge = this.edges[i];
            let possibleIntersection = currEdge.intersectionCheck(new Point(feeler), expandedTurtle.position);
            if (possibleIntersection) {
                return null;
            }
        }
        // Point Snap Check
        for (let i = 0; i < this.points.length; i++) {
            let currPoint = this.points[i];
            if (expandedTurtle.position.withinCircle(currPoint.position, 25)) {
                return null;
            }
        }
        // Water Check
        if (this.textureUtil.getWater(expandedTurtle.position.position[0], expandedTurtle.position.position[2]) == 0) {
            return null;
        }
        let newEdge = new Edge(newOrigin, expandedTurtle.position, false);
        this.edges.push(newEdge);
        return expandedTurtle;
    }
    createRoadTurtle(expandedPos) {
        let newPoint = new Point(expandedPos);
        let newFor = vec3.create();
        vec3.copy(newFor, this.forward);
        let newUp = vec3.create();
        vec3.copy(newUp, this.up);
        let newRight = vec3.create();
        vec3.copy(newRight, this.right);
        let newQuat = quat.create();
        quat.copy(newQuat, this.quaternion);
        return new Turtle(newPoint, newFor, newUp, newRight, newQuat, 0, this.textureUtil, this.points, this.edges, this.iterations, this.gridSize, this.popThreshold);
    }
    // Expands a road turtle off of a highway turtle
    roadTurtleExpansionRule(currExpansionTurtle, validExpansionTurtles) {
        let branchRight = vec3.create();
        branchRight = vec3.fromValues(currExpansionTurtle.point.position[0] + this.gridSize * currExpansionTurtle.right[0], currExpansionTurtle.point.position[1] + this.gridSize * currExpansionTurtle.right[1], currExpansionTurtle.point.position[2] + this.gridSize * currExpansionTurtle.right[2]);
        let rightTurtle = this.roadTurtleConstraints(currExpansionTurtle.point, this.createRoadTurtle(branchRight));
        if (rightTurtle != null) {
            validExpansionTurtles.push(rightTurtle);
        }
        let branchLeft = vec3.create();
        branchLeft = vec3.fromValues(currExpansionTurtle.point.position[0] - this.gridSize * currExpansionTurtle.right[0], currExpansionTurtle.point.position[1] - this.gridSize * currExpansionTurtle.right[1], currExpansionTurtle.point.position[2] - this.gridSize * currExpansionTurtle.right[2]);
        let leftTurtle = this.roadTurtleConstraints(currExpansionTurtle.point, this.createRoadTurtle(branchLeft));
        if (leftTurtle != null) {
            validExpansionTurtles.push(leftTurtle);
        }
    }
    // Returns a list of the next turtles that spawn from the current turtle
    simulate() {
        let possibleExpansionTurtles = this.expansionRule();
        let validExpansionTurtles = [];
        for (let i = 0; i < possibleExpansionTurtles.length; i++) {
            let currExpansionTurtle = this.localConstraints(possibleExpansionTurtles[i]);
            // Adds new highway turtle to expanded turtles returned
            if (currExpansionTurtle) {
                let newEdge = new Edge(this.point, currExpansionTurtle.point, true);
                this.points.push(currExpansionTurtle.point);
                this.edges.push(newEdge);
                validExpansionTurtles.push(currExpansionTurtle);
                // Expands new road turtles from the highway
                if (this.waterFlag) {
                    this.roadTurtleExpansionRule(currExpansionTurtle, validExpansionTurtles);
                }
            }
        }
        this.expansionRuleFirstExpansion(validExpansionTurtles);
        return validExpansionTurtles;
    }
}
//# sourceMappingURL=HighwayTurtle.js.map