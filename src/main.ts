import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Plane from './geometry/Plane';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './lsystem/LSystem';
import CityGrid from './citysystem/CityGrid';

let changed: boolean = true;

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

let mapVal: number = 0;

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

let square: Square;
let screenQuad: ScreenQuad;
let plane: Plane;
let time: number = 0.0;

let lsystem: LSystem;
let grid: CityGrid;

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  plane = new Plane(vec3.fromValues(0, 0, 0), vec2.fromValues(2, 2), 8);
  plane.create();
}

function runLSystem() {
  // Simulate LSystem with number of iterations
  lsystem.simulate(controls['Iterations'], controls['Grid Size'], controls['Pop Threshold']);

  // Start City Generation
  let result: number[][] = grid.generateGrid(lsystem.edges, controls['Pop Threshold']);

  // Instance Render the street data
  let vboData: any = lsystem.getVBOData();
  square.setInstanceVBOsFullTransform(vboData.col1, vboData.col2, vboData.col3, vboData.col4, vboData.colors);
  square.setNumInstances(vboData.col1.length / 4.0);
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
  gui.add(controls, 'Iterations', 0, 20).step(1).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Grid Size', 3, 10).step(1).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Pop Threshold', 0, 1).step(0.05).onChange(
    function() {
      changed = true;
    }.bind(this));


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
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
  gl.enable(gl.DEPTH_TEST)
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
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
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

  const texturecanvas = <HTMLCanvasElement> document.getElementById('texturecanvas');
  const textureRenderer = new OpenGLRenderer(texturecanvas);

  // width of the texture, this is our resolution for our L-system
  const width = 2000;
  const height = 2000;

  textureRenderer.setSize(width, height);
  textureRenderer.setClearColor(0, 0, 0, 1);

  let textureData: Uint8Array = textureRenderer.renderTexture(camera, textureShader, [screenQuad]);

  lsystem = new LSystem(textureData);
  grid = new CityGrid(textureData);
  /** Texture Renderer and LSystem Setup End Here **/

  // Start the render loop
  tick();
}

main();
