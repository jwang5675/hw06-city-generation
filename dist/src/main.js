import { vec2, vec3 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Plane from './geometry/Plane';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import LSystem from './lsystem/LSystem';
import CityGrid from './citysystem/CityGrid';
let changed = true;
// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
    'Show Water': showWater,
    'Show Elevation': showElevation,
    'Show Population Density': showPopulationDensity,
    'Elevation & Pop Density': showElevationAndDensity,
    'Iterations': 15,
    'Grid Size': 8,
    'Pop Threshold': 0.4,
};
let mapVal = 0;
function showWater() {
    mapVal = 0;
}
function showElevation() {
    mapVal = 1;
}
function showPopulationDensity() {
    mapVal = 2;
}
function showElevationAndDensity() {
    mapVal = 3;
}
let square;
let screenQuad;
let plane;
let cube;
let time = 0.0;
let lsystem;
let grid;
function loadScene() {
    // Square used to instance render roads
    square = new Square();
    square.create();
    // Quad used to instance render skybox
    screenQuad = new ScreenQuad();
    screenQuad.create();
    // Plane used to instance render the land elevation
    plane = new Plane(vec3.fromValues(0, 0, 0), vec2.fromValues(2, 2), 8);
    plane.create();
    // Cube used to instance render the buildings
    cube = new Cube(vec3.fromValues(0, 0, 0));
    cube.create();
}
function runLSystem() {
    // Simulate LSystem with number of iterations
    lsystem.simulate(controls['Iterations'], controls['Grid Size'], controls['Pop Threshold']);
    // Start City Generation
    let result = grid.generateGrid(lsystem.edges, controls['Pop Threshold']);
    // Instance Render the street data
    let vboData = lsystem.getVBOData();
    square.setInstanceVBOsFullTransform(vboData.col1, vboData.col2, vboData.col3, vboData.col4, vboData.colors);
    square.setNumInstances(vboData.col1.length / 4.0);
    // Instance Render the buildings
    let buildingData = grid.getVBODataBuildings();
    cube.setInstanceVBOsTransform(buildingData.col1, buildingData.col2, buildingData.col3, buildingData.col4, buildingData.colors);
    cube.setNumInstances(buildingData.col1.length / 4.0);
}
function main() {
    // Initial display for framerate
    const stats = Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    // Add controls to the gui
    const gui = new DAT.GUI();
    gui.add(controls, 'Show Water');
    gui.add(controls, 'Show Elevation');
    gui.add(controls, 'Show Population Density');
    gui.add(controls, 'Elevation & Pop Density');
    gui.add(controls, 'Iterations', 0, 20).step(1).onChange(function () {
        changed = true;
    }.bind(this));
    gui.add(controls, 'Grid Size', 3, 10).step(1).onChange(function () {
        changed = true;
    }.bind(this));
    gui.add(controls, 'Pop Threshold', 0, 1).step(0.05).onChange(function () {
        changed = true;
    }.bind(this));
    // get canvas and webgl context
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL 2 not supported!');
    }
    // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
    // Later, we can import `gl` from `globals.ts` to access it
    setGL(gl);
    // Initial call to load scene
    loadScene();
    const camera = new Camera(vec3.fromValues(0, 100, 0), vec3.fromValues(0, 0, 0));
    const renderer = new OpenGLRenderer(canvas);
    renderer.setClearColor(0.2, 0.2, 0.2, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.ONE, gl.ONE);
    const instancedShader = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
    ]);
    const flat = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
    ]);
    const planeShader = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/plane-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/plane-frag.glsl')),
    ]);
    const buildingShader = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/building-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/building-frag.glsl')),
    ]);
    // This function will be called every frame
    function tick() {
        camera.update();
        stats.begin();
        if (changed) {
            changed = false;
            runLSystem();
        }
        instancedShader.setTime(time);
        flat.setTime(mapVal);
        gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.clear();
        renderer.render(camera, flat, [screenQuad]);
        renderer.render(camera, instancedShader, [square]);
        renderer.render(camera, planeShader, [plane]);
        renderer.render(camera, buildingShader, [cube]);
        stats.end();
        // Tell the browser to call `tick` again whenever it renders a new frame
        requestAnimationFrame(tick);
    }
    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.setAspectRatio(window.innerWidth / window.innerHeight);
        camera.updateProjectionMatrix();
        flat.setDimensions(window.innerWidth, window.innerHeight);
    }, false);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
    /** Texture Renderer and LSystem Setup Start Here **/
    const textureShader = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/texture-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/texture-frag.glsl')),
    ]);
    const texturecanvas = document.getElementById('texturecanvas');
    const textureRenderer = new OpenGLRenderer(texturecanvas);
    // width of the texture, this is our resolution for our L-system
    const width = 2000;
    const height = 2000;
    textureRenderer.setSize(width, height);
    textureRenderer.setClearColor(0, 0, 0, 1);
    let textureData = textureRenderer.renderTexture(camera, textureShader, [screenQuad]);
    lsystem = new LSystem(textureData);
    grid = new CityGrid(textureData);
    /** Texture Renderer and LSystem Setup End Here **/
    // Start the render loop
    tick();
}
main();
//# sourceMappingURL=main.js.map