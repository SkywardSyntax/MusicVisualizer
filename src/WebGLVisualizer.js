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

    this.numPoints = 512; // Increased for smoother waveform
    this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
    this.init();
  }

  init() {
    const gl = this.gl;

    // Vertex shader program
    const vsSource = `
      attribute vec2 aVertexPosition;
      attribute float aFrequency;

      varying lowp float vFrequency;

      void main(void) {
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
        vFrequency = aFrequency;
      }
    `;

    // Fragment shader program
    const fsSource = `
      precision mediump float;
      varying lowp float vFrequency;

      void main(void) {
        gl_FragColor = vec4(vFrequency, 0.0, 1.0 - vFrequency, 1.0);
      }
    `;

    const shaderProgram = this.initShaderProgram(gl, vsSource, fsSource);

    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        frequency: gl.getAttribLocation(shaderProgram, 'aFrequency'),
      },
    };

    this.buffers = this.initBuffers(gl);
  }

  initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [];
    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * 2 * Math.PI;
      const radius = 0.8; 
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      positions.push(x, y);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const frequencyBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, frequencyBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.numPoints), gl.DYNAMIC_DRAW);

    return {
      position: positionBuffer,
      frequency: frequencyBuffer,
    };
  }

  drawScene(dataArray, sensitivity) {
    const gl = this.gl;

    for (let i = 0; i < this.numPoints; i++) {
      this.frequencyData[i] = dataArray[i] / 255.0 * sensitivity; // Apply sensitivity
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.frequency);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.frequencyData);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.frequency,
      1,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.frequency);

    gl.useProgram(this.programInfo.program);
    gl.drawArrays(gl.LINE_STRIP, 0, this.numPoints);
  }
}

export default WebGLVisualizer;