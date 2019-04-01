# Homework 6: CITY Generation

Jason Wang (jasonwa)

External Resources: 
- CIS 460 Rasterizer code

Demo (make your window have a 1:1 aspect ratio for best results) : https://jwang5675.github.io/hw05-road-generation/

![](images/elepop.png)

## Implemented Details

- __(Generating 2D Map Data)__
  - I used a 2D FBM Noise function with quadratic smoothing to generate the water, elevation, and population height fields. Water and elevation is made from the same FBM function, while population density offsets the FBM in order to make the maps different from each other. By sampling different parts of the FBM function, the lower elevation portions of the elevation map have higher population density near the water and the higher elevation portions of the map has lower population density.
  - To recover the noise data from the GPU to the CPU, I added an additional render pass that creates a framebuffer that renders the fbm noise to a texture. The texture stores the FBM information in RGBA texture in the format (r = waterFBM, g = elevationFBM, b = populationFBM, alpha = 1). I then use gl.readPixels() to recover the pixel data into array format and then query x, y points in the array at index = textureHeight * y * 4 + x * 4 + offset to get fbm information (offset = 0 implies waterFBM, = 1 implies elevationFbm, etc.)
  -  The user can toggle the gui to show the following map data:
    - Water Map (blue = water, white = land)
    ![](images/water.png)
    - Elevation Map (dark green = low elevation, light green = high elevation)
    ![](images/height.png)
    - Population Map (dark red = low population density, light red = high/dense population density)
    ![](images/population.png)
    - Elevation & Pop Map (elevation and population map layered on each other)
    ![](images/elepop.png)

- __(Class Set to Represent LSystems)__
  - There are two types of turtles in this scene
    - HighwayTurtle: Describes the turtles that spawn the other Highway Turtles as well as other Turtles (road turtles)
    - Turtle: Describe the smaller road turtles that spawn dense roads in the scene.
  - Highway Turtles start at a point in the scene and has a target point that it will reach. Depending on flags defined in the constructor, highway turtles can either cross oceans to get to the desired point or try to move around oceans to get to the target point. Each highway turtle basically creates connections between the majors cities of population density in the LSystem. 
  - Each time a Turtle (Road turtle, smaller roads) creates a road, it evaluates user defined grid size and density based to see if it should expand to more roads, turtles will always branch in a 90 degree angle.
  - All roads (highway or city roads) are stored as points and edges.
    - Points contain a position, and a function that checks if another point lies within a certain radius of the current point
    - Edges contain 2 points that make up the point. Edges 2 main functions that are called by other classes: getTransformation() that is used to draw the current edge as a road using instanced render and split()/intersectionCheck() that checks if another edge has intersected with the current edge and splits the edge if so

- __(Drawing Road Rules)__
  - Supports:
    - Basic Road Branching: the roads cutoff and do not expand after some specified population threshold defined by the user in the GUI (see below)
    - Checkered Road Branching: the roads all branch off of the highways' forward, up, and right vectors at 90 degrees with a specified maximum width and length based on the grid size defined by the user in the GUI (see below)

- __(2D Street Layout)__
  - Highways are generate and are sparse throughout the scene
  - As the highways are being built, the spawn smaller and thinner road networks with specified denseness based on the user input grid size and population density threshold
  - The smaller roads follow checkered 90 degree and population threshold cutoff branching
  - The only roads that can cross water are the thicker highways
  - Roads are self-sensitive as described in 3.3.1.
    - Roads implement line segment intersection for intersection/extension, example: ![](images/intersect.png)
    - Roads implement snapping to a nearby point, example ![](images/pointsnap.png)

- __(Interactive GUI)__
  - Changing # of iterations the LSystem Completes (Highways are always completed)
    - 1 Iteration
    ![](images/1itr.png)
    - 2 Iterations
    ![](images/2itr.png)
    - 5 Iterations
    ![](images/5itr.png)
    - 10 Iterations
    ![](images/10itr.png)
    - 15 Iterations
    ![](images/elepop.png)
  - Changing Grid Size (Highways are always completed)
    - Grid size = 3
    ![](images/elepop.png)
    - Grid size = 6
    ![](images/grid6.png)
    - Grid size = 9
    ![](images/grid9.png)
  - Population Threshold (Highways are always completed)
    - low threshold to generate a new road
    ![](images/lowthresh.png)
    - medium threshold to generate a new road
    ![](images/elepop.png)
    - high threshold to generate a new road
    ![](images/highthresh.png)
