class WebGLVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');

    if (!this.gl) {
      console.error('WebGL not supported, falling back on experimental-webgl');
      this.gl = canvas.getContext('experimental-webgl');
    }

    if (!this.gl) {
      alert('Your browser does not support WebGL');
    }

    this.init();
  }

  init() {
    const gl = this.gl;

    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main(void) {
        gl_Position = aVertexPosition;
      }
    `;

    // Fragment shader program
    const fsSource = `
      precision mediump float;
      uniform float uFrequency;
      void main(void) {
        gl_FragColor = vec4(uFrequency, 0.0, 0.0, 1.0);
      }
    `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = this.initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        frequency: gl.getUniformLocation(shaderProgram, 'uFrequency'),
      },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    this.buffers = this.initBuffers(gl);
  }

  initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  initBuffers(gl) {
    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.

    const positions = [
      1.0,  1.0,
      -1.0, 1.0,
      1.0,  -1.0,
      -1.0, -1.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(positions),
                  gl.STATIC_DRAW);

    return {
      position: positionBuffer,
    };
  }

  drawScene(dataArray, sensitivity) {
    const gl = this.gl;

    // Clear the canvas before we start drawing on it.

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2;  // pull out 2 values per iteration
      const type = gl.FLOAT;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 0;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      gl.vertexAttribPointer(
          this.programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          this.programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(this.programInfo.program);

    // Set the shader uniforms
    gl.uniform1f(this.programInfo.uniformLocations.frequency, dataArray[0] / 255.0 * sensitivity);

    // Draw the square

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }
}

export default WebGLVisualizer;