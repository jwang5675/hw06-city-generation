# Homework 6: City Generation

Jason Wang (jasonwa)

External Resources: 
- CIS 460 Rasterizer code

Demo (warning, scene is a bit slow, lowering resolution would provide for a better experience) : https://jwang5675.github.io/hw06-city-generation/

![](images/city.png)

## Implemented Details

- __(Create 3D Environment)__
  - Created a 3D model of the terrain from the last homework assignment. I accomplished this by multiplying the previous homework's position by the camera's view projection matrix
  - ![](images/3dmap.png)
  - Also, there is a small slope between the water and the land accomplished by using a subdivided plane and then sampling water FBM to lower the vertex position data in the vertex shader.
  - ![](images/smoothtransition.png)

- __(Created 3D Roads)__
  - Created a 3D roads. I accomplished this by adding a small y height to the original roads in the previous assignment and then multiplied the roads by the camera's view projection matrix.

- __(Road Rasterization)__
  - Rasterized the roads and water to a grid of resolution 2000 x 2000. I accomplished this with a similar rasterization technique for line segments in CIS 460 HW03 where I intersected horizontal lines on the grid (y = 0, y = 1, etc.) with each road. If there is an intersection, I mark that line on the grid and then add a small delta around the marked point to make the roads appear thicker. For water rasterization, I just sample my FBM texture similar to the previous assignment.
  - Results: (original 3D model on the left vs. rasterized grid view on the right)
  - ![](images/raster.png)

- __(Generating Building Points)__
  - Once the roads and the water have been rasterized, I randomly choose points on the grid and add buildings. I check neighboring grid cells to make sure that I am not over lapping with any roads or water.
  - Result:
  - ![](images/buildingplacement.png)

- __(Generate Building Geometry)__
  - I generated the building geometry as described in the figured 3 below using only a cuboid polygon. 
  - ![](images/figure3.png)
  - In my generation, in the below example, you can see that the red elongated cuboid represents the original building and all the gray buildings are extruded pieces from the algorithm
  - Top View:
  - ![](images/buildingtop.png)
  - Side View:
  - ![](images/buildingside.png)
  - The heights also differ accross different population densities. Population near the water is higher compared to the population further away. Replacing the building spots with actual buildings using instanced rendering and VBO transformation data, we get the following scene:
  - ![](images/plaincity.png)

- __(Generate Building Textures)__
  - Added basic fbm to the side of the building to add some texture
  - Added a mod function to add windows to the scene with a varying of light
  - Offset the mod function to add windows at non uniform spots on the buildings such that the buildings do not all look the same
  - Removed windows near the roof of the buildings to allow buildings to have uniform looking shapes towards the roof

- __(Generating Environment Lighting)__
  - In the scene, there is some Lambertian lighting applied to the buildings to make them more 3D in appearance. As a future goal, a way to add shadows to the scene is to use a shadow map by saving a depth buffer from each lights point of view and then sampling the scene with the camera on the depth buffer to determine shadows.

- __(Procedural Sky Background)__
  - Added a basic blue hue sky with stars as the sky background
  - Added a small amount of FBM to the sky to make it less uniform with moving stars
  - The sky adds additional r and g values to the blue sky depending on the ray position so when the user moves around the sky, the blue gets a small amount of hue from different colors to simulate camera movement
  - Red Hue Example:
  - ![](images/redhue.png)
  - Green Hue Example: 
  - ![](images/greenhue.png)
  - Blue Hue Example:
  -![](images/bluehue.png)
