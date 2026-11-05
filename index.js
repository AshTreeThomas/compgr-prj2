//Prj 2 - Thomas H
const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('Sorry, your browser does not support WebGL.');
}

//variables
let currentLevel = 0;
let heightScale = 1.0;

//from class example, I say that a bit on these top parts, its based on the w3 cubes and self quiz we did inside it.
const vertexShaderSource = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;    
  uniform mat4 uModel;        
  uniform mat4 uView;        
  uniform mat4 uProjection;
  varying vec3 vNormal;

  void main() {
    vNormal = normalize(mat3(uModel) * aNormal);
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
  }
`;

//from class example
const fragmentShaderSource = `
  precision mediump float;
  uniform vec3 uColor;
  varying vec3 vNormal;

  void main() {
    vec3 lightDirection = normalize(vec3(0.5, 1.0, 0.3));
    float brightness = max(dot(vNormal, lightDirection), 0.0);
    float light = 0.3 + 0.7 * brightness;
    gl_FragColor = vec4(uColor * light, 1.0);   
  }
`;

//from class example
function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

//from class example
const program = gl.createProgram();
gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
gl.linkProgram(program);
gl.useProgram(program);

// Cube Geometry from class example
const cubeVertices = new Float32Array([
  // Front face (normal points toward +z)
  -0.5, 0, 0.5,   0, 0, 1,
   0.5, 0, 0.5,   0, 0, 1,
   0.5, 1, 0.5,   0, 0, 1,
  -0.5, 0, 0.5,   0, 0, 1,
   0.5, 1, 0.5,   0, 0, 1,
  -0.5, 1, 0.5,   0, 0, 1,
  // Back face (-z)
  -0.5, 0, -0.5,  0, 0, -1,
   0.5, 1, -0.5,  0, 0, -1,
   0.5, 0, -0.5,  0, 0, -1,
  -0.5, 0, -0.5,  0, 0, -1,
  -0.5, 1, -0.5,  0, 0, -1,
   0.5, 1, -0.5,  0, 0, -1,
  // Top face (+y)
  -0.5, 1, -0.5,  0, 1, 0,
  -0.5, 1,  0.5,  0, 1, 0,
   0.5, 1,  0.5,  0, 1, 0,
  -0.5, 1, -0.5,  0, 1, 0,
   0.5, 1,  0.5,  0, 1, 0,
   0.5, 1, -0.5,  0, 1, 0,
  // Bottom face (-y)
  -0.5, 0, -0.5,  0, -1, 0,
   0.5, 0,  0.5,  0, -1, 0,
  -0.5, 0,  0.5,  0, -1, 0,
  -0.5, 0, -0.5,  0, -1, 0,
   0.5, 0, -0.5,  0, -1, 0,
   0.5, 0,  0.5,  0, -1, 0,
  // Right face (+x)
   0.5, 0, -0.5,  1, 0, 0,
   0.5, 1, -0.5,  1, 0, 0,
   0.5, 1,  0.5,  1, 0, 0,
   0.5, 0, -0.5,  1, 0, 0,
   0.5, 1,  0.5,  1, 0, 0,
   0.5, 0,  0.5,  1, 0, 0,
  // Left face (-x)
  -0.5, 0, -0.5, -1, 0, 0,
  -0.5, 1,  0.5, -1, 0, 0,
  -0.5, 1, -0.5, -1, 0, 0,
  -0.5, 0, -0.5, -1, 0, 0,
  -0.5, 0,  0.5, -1, 0, 0,
  -0.5, 1,  0.5, -1, 0, 0,
]);
const VERTEX_COUNT = 36;

//from class example
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

//from class example
const BYTES_PER_FLOAT = 4;
const stride = 6 * BYTES_PER_FLOAT;
const aPosition = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);
const aNormal = gl.getAttribLocation(program, 'aNormal');
gl.enableVertexAttribArray(aNormal);
gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, stride, 3 * BYTES_PER_FLOAT);

//from class example
const uModel = gl.getUniformLocation(program, 'uModel');
const uView = gl.getUniformLocation(program, 'uView');
const uProjection = gl.getUniformLocation(program, 'uProjection');
const uColor = gl.getUniformLocation(program, 'uColor');

// Level 1, (lvl 0 is at bottom) largely based on the class example
const GRID_SIZE = 20;
const SPACING = 1.0;
const cubes = [];
for (let row = 0; row < GRID_SIZE; row++) {
  for (let col = 0; col < GRID_SIZE; col++) {
    cubes.push({
      x: (col - (GRID_SIZE - 1) / 2) * SPACING,
      z: (row - (GRID_SIZE - 1) / 2) * SPACING,
      baseHeight: 0.5 + Math.random() * 4,
      color: [Math.random() * 0.4, Math.random() * 0.6 + 0.4, Math.random() * 0.4] //Im using shades of green, sense lvl 2 and 3 are landscapes just keeping the theme
    });
  }
}

// Level 2 & 3 is Heightmap Setup but then i did a steepness based Coloring (Stone and Grass) instead of albedo/img colors
let level2Cubes = [];
const heightmapImg = new Image();
heightmapImg.src = 'heightmap.png';
heightmapImg.onload = function() {
  //based off the W3 schools page
  //https://www.w3schools.com/tags/canvas_getimagedata.asp
  const hCanvas = document.createElement('canvas');
  hCanvas.width = heightmapImg.width;
  hCanvas.height = heightmapImg.height;
  const hCtx = hCanvas.getContext('2d');
  hCtx.drawImage(heightmapImg, 0, 0);
  const imgData = hCtx.getImageData(0, 0, hCanvas.width, hCanvas.height);
  const data = imgData.data;

  const width = heightmapImg.width;   // any size png
  const height = heightmapImg.height; // ^^
  const L2_SPACING = 0.25;            //1.0 spacing will make my pc go poop on larger ones, may be the steepness calculations

  // Build height grid
  // just take the greyscale rgb value divided by 255, to turn rgb into 1.0 scale, than include that into the heightscale
  const heightGrid = [];
  for (let row = 0; row < height; row++) {
    const rowHeights = [];
    for (let col = 0; col < width; col++) {
      const index = (row * width + col) * 4;
      const gray = data[index] / 255.0;
      const baseHeight = gray * 4.5 + 0.2;
      rowHeights.push(baseHeight);
    }
    heightGrid.push(rowHeights);
  }

  // Basically my level 4 - steepness relative to neighbors and assign colors
  // I have done similar things on my own in the past, for snowdrift in a minecraft mod and autoterrain material in unreal engine.
  const steepThreshold = 0.07;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const baseHeight = heightGrid[row][col];
      let maxDiff = 0;
      //like a computer vision kernel, its checking the surrounding cubes data and comparing
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
      ];
      //grab the biggest difference of the neighboring cubes height
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
          const diff = Math.abs(baseHeight - heightGrid[nr][nc]);
          if (diff > maxDiff) {
            maxDiff = diff;
          }
        }
      }
      // If steep difference, Gray stone. Otherwise grass
      let color;
      if (maxDiff > steepThreshold) {
        color = [0.5, 0.5, 0.5]; // Gray stone
      } else {
        color = [0.1, 0.38, 0.18]; // Dark green grass
      }
      //the final grid of cubes, height and color.
      level2Cubes.push({
        x: (col - (width - 1) / 2) * L2_SPACING,
        z: (row - (height - 1) / 2) * L2_SPACING,
        baseHeight: baseHeight,
        color: color
      });
    }
  }
};

// Level 3 bezier curves, i just did clouds. I'm doing 2 similar curves so it looks like the wind guiding the clouds.
const bezierPaths = [
  {
    p0: [-35, 18, -35],
    p1: [-15, 20, 30],
    p2: [30, 22, 35],
    p3: [35, 18, -30],
    speed: 0.02
  },
  {
    p0: [-30, 20, -35],
    p1: [-10, 22, 25],
    p2: [25, 24, 30],
    p3: [30, 20, -25],
    speed: 0.018
  }
];
//just like the cubes from earlier but it ties a path var to the cube. Random sizes for the clouds rotation follows the curve.
const clouds = [];
for (let i = 0; i < 5; i++) {
  clouds.push({
    pathIndex: 0,
    tOffset: i / 5,
    scale: [2.0 + Math.random() * 2.5, 0.8 + Math.random() * 0.8, 1.5 + Math.random() * 1.5],
    rotation: Math.random() * Math.PI * 2
  });
  clouds.push({
    pathIndex: 1,
    tOffset: (i + 0.5) / 5,
    scale: [2.0 + Math.random() * 2.5, 0.8 + Math.random() * 0.8, 1.5 + Math.random() * 1.5],
    rotation: Math.random() * Math.PI * 2
  });
}
//Im just doing the cubic bezer formula
// i didnt really follow the github for this one,works cited:
// https://stackoverflow.com/questions/4089443/find-the-tangent-of-a-point-on-a-cubic-bezier-curve
// and https://blog.rectorsquid.com/cubic-bezier-drawing-and-nearest-point-to-point/
function evaluateCubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0],
    mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1],
    mt3 * p0[2] + 3 * mt2 * t * p1[2] + 3 * mt * t2 * p2[2] + t3 * p3[2]
  ];
}

// Matrix Math Helpers from the class example
function translation(x, y, z) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,
  ];
}
function scaling(sx, sy, sz) {
  return [
    sx, 0,  0,  0,
    0,  sy, 0,  0,
    0,  0,  sz, 0,
    0,  0,  0,  1,
  ];
}
function multiply(a, b) {
  const result = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++) {
        result[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
      }
    }
  }
  return result;
}
function perspective(fieldOfView, aspect, near, far) {
  const f = 1 / Math.tan(fieldOfView / 2);
  return [
    f / aspect, 0, 0,                                0,
    0,          f, 0,                                0,
    0,          0, (far + near) / (near - far),    -1,
    0,          0, (2 * far * near) / (near - far), 0,
  ];
}
function lookAt(eye, target, up) {
  const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const normalize = (a) => {
    const length = Math.hypot(a[0], a[1], a[2]);
    return [a[0] / length, a[1] / length, a[2] / length];
  };
  const zAxis = normalize(subtract(eye, target));
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  return [
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
  ];
}
//function added for bezier curves, asked ai to follow the styles of previous transformers above so i can make the clouds turn with the curve.
function rotationY(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
     c, 0,  s, 0,
     0, 1,  0, 0,
    -s, 0,  c, 0,
     0, 0,  0, 1,
  ];
}

//Level switcher function, work cited: https://www.w3schools.com/bootstrap/bootstrap_ref_js_button.asp
window.setLevel = function(level) {
  currentLevel = level;
  document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-lvl${level}`).classList.add('active');
};

// Keyboard listener for height scale adjustment on lvl 1 and also can be used after lvl 1
window.addEventListener('keydown', (e) => {
  if (currentLevel >= 1) {
    if (e.key == 'ArrowUp') {
      heightScale += 0.25;
    } else if (e.key == 'ArrowDown') {
      heightScale = Math.max(0.25, heightScale - 0.25); //Minimum scale of .25
    }
  }
});

// Animation Loop for rendering and camera orbit, based on the example github
// https://github.com/jauri/ucincinnati-graphics-course/blob/main/webGL-examples/examples/camera-move/index.js
const ORBIT_SPEED = 0.2;
const LOOK_AT = [0, 0, 0];
const UP = [0, 1, 0];
const startTime = performance.now();
//I moved some camera components since i wanted a wider view for lvl 3 (cuz of the clouds)
function render(now) {
  const seconds = (now - startTime) / 1000;
  //the moved camera stuff
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  //quick sky background for the landscape lvls
  if (currentLevel <= 1) {gl.clearColor(0, 0, 0, 1);} else { gl.clearColor(0.2, 0.5, 0.7, 1.0);}
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = canvas.width / canvas.height;
  gl.uniformMatrix4fv(uProjection, false, perspective(Math.PI / 4, aspect, 0.1, 300));

  // Level 0 single cube is here
  if (currentLevel == 0) {
    gl.uniformMatrix4fv(uView, false, lookAt([4, 3, 5], LOOK_AT, UP));
    const model = multiply(
      translation(-1, -1, -1),
      scaling(2, 2, 2)
    );
    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniform3fv(uColor, [0.2, 1.0, 0.2]);
    gl.drawArrays(gl.TRIANGLES, 0, VERTEX_COUNT);
  //else camera rotate and the stuff in level 1+
  } else {
    // Camera orbit settings for all other levels
    const angle = seconds * ORBIT_SPEED;
    const radius = (currentLevel == 3) ? 55.0 : 35.0;
    const camHeight = (currentLevel == 3) ? 26.0 : 16.0;
    const eye = [
      radius * Math.cos(angle),
      camHeight,
      radius * Math.sin(angle),
    ];
    gl.uniformMatrix4fv(uView, false, lookAt(eye, LOOK_AT, UP));

    //If level 2 or three, target cubes is assigned lvl 2 landscape cubes instead of the random grid from lvl 1
    const targetCubes = (currentLevel >= 2) ? level2Cubes : cubes;

    //from class example but tweaked
    for (const cube of targetCubes) {
      const currentHeight = cube.baseHeight * heightScale;
      // Scale X and Z to match spacing (0.25) for levels 2/3 so cubes don't overlap and cause z fighting. Its cheaper than making spacing 1.
      const scaleX = (currentLevel >= 2) ? 0.25 : 1.0;
      const scaleZ = (currentLevel >= 2) ? 0.25 : 1.0;
      const model = multiply(
        translation(cube.x, 0, cube.z),
        scaling(scaleX, currentHeight, scaleZ),
      );
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniform3fv(uColor, cube.color);
      gl.drawArrays(gl.TRIANGLES, 0, VERTEX_COUNT);
    }

    // Level 3 clouds for bezier
    if (currentLevel == 3) {
      for (const cloud of clouds) {
        //move
        const path = bezierPaths[cloud.pathIndex];
        let t = (seconds * path.speed + cloud.tOffset) % 1.0;
        if (t < 0) t += 1.0;
        //run the bezier function
        const pos = evaluateCubicBezier(path.p0, path.p1, path.p2, path.p3, t);
        //cloud cubes
        const model = multiply(
          translation(pos[0], pos[1], pos[2]),
          multiply(
            rotationY(cloud.rotation),
            scaling(cloud.scale[0], cloud.scale[1], cloud.scale[2])
          )
        );
        gl.uniformMatrix4fv(uModel, false, model);
        gl.uniform3fv(uColor, [0.95, 0.95, 0.98]); // Bright white cloud color
        gl.drawArrays(gl.TRIANGLES, 0, VERTEX_COUNT);
      }
    }
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);