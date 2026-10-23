/**
 * Bilva Tech — React Bits Dither WebGL2 Engine for Solution CTAs
 *
 * Exact WebGL2 shader and dithering implementation ported from @react-bits/Dither-JS-CSS
 * https://reactbits.dev/backgrounds/dither
 * https://reactbits.dev/r/Dither-JS-CSS.json
 *
 * Configured specifically for the Solution CTA section:
 * - Background color: #120f17
 * - Wave color: #bcbcbc
 * - Color levels (colorNum): 4
 * - Pixel size: 2
 * - Wave speed: 0
 * - Wave frequency: 3
 * - Wave amplitude: 0.34
 * - Mouse interaction: disabled
 * - Mouse radius: 0.05
 * - Scale: 0.3
 * - Brightness: -0.03
 * - Mouse strength: 0
 * - Trail: 0
 */

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory((global.BilvaDither = {}));
  }
})(this, function (exports) {
  'use strict';

  var MODES = { bayer: 0, bayer4: 1, bayer2: 2, halftone: 3, lines: 4, crosshatch: 5, noise: 6, none: 7 };
  var EFFECTS = { erase: 0, reveal: 1, ripple: 2 };
  var MAX_TRAIL = 16;
  var MAX_RIPPLES = 4;
  var MAX_PALETTE = 8;
  var RIPPLE_SECONDS = 1.6;

  var VERTEX =
    '#version 300 es\n' +
    'in vec2 aPosition;\n' +
    'void main() {\n' +
    '  gl_Position = vec4(aPosition, 0.0, 1.0);\n' +
    '}\n';

  var WAVE_FRAGMENT =
    '#version 300 es\n' +
    'precision highp float;\n' +
    'precision highp int;\n' +
    'uniform vec2 uResolution;\n' +
    'uniform float uCell;\n' +
    'uniform float uTime;\n' +
    'uniform float uWaveSpeed;\n' +
    'uniform float uWaveFrequency;\n' +
    'uniform float uWaveAmplitude;\n' +
    'uniform float uScale;\n' +
    'uniform float uContrast;\n' +
    'uniform float uBrightness;\n' +
    'uniform int uEffect;\n' +
    'uniform float uRadius;\n' +
    'uniform float uStrength;\n' +
    'uniform vec3 uTrail[' + MAX_TRAIL + '];\n' +
    'uniform int uTrailCount;\n' +
    'uniform vec4 uRipples[' + MAX_RIPPLES + '];\n' +
    'uniform int uRippleCount;\n' +
    'uniform float uIntro;\n' +
    'uniform float uReach;\n' +
    'out vec4 outColor;\n' +
    '\n' +
    'vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\n' +
    'vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\n' +
    'vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\n' +
    'vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\n' +
    '\n' +
    'float cnoise(vec2 P) {\n' +
    '  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n' +
    '  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n' +
    '  Pi = mod289(Pi);\n' +
    '  vec4 ix = Pi.xzxz;\n' +
    '  vec4 iy = Pi.yyww;\n' +
    '  vec4 fx = Pf.xzxz;\n' +
    '  vec4 fy = Pf.yyww;\n' +
    '  vec4 i = permute(permute(ix) + iy);\n' +
    '  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;\n' +
    '  vec4 gy = abs(gx) - 0.5;\n' +
    '  vec4 tx = floor(gx + 0.5);\n' +
    '  gx = gx - tx;\n' +
    '  vec2 g00 = vec2(gx.x, gy.x);\n' +
    '  vec2 g10 = vec2(gx.y, gy.y);\n' +
    '  vec2 g01 = vec2(gx.z, gy.z);\n' +
    '  vec2 g11 = vec2(gx.w, gy.w);\n' +
    '  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\n' +
    '  g00 *= norm.x;\n' +
    '  g01 *= norm.y;\n' +
    '  g10 *= norm.z;\n' +
    '  g11 *= norm.w;\n' +
    '  float n00 = dot(g00, vec2(fx.x, fy.x));\n' +
    '  float n10 = dot(g10, vec2(fx.y, fy.y));\n' +
    '  float n01 = dot(g01, vec2(fx.z, fy.z));\n' +
    '  float n11 = dot(g11, vec2(fx.w, fy.w));\n' +
    '  vec2 fadeXY = fade(Pf.xy);\n' +
    '  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);\n' +
    '  return 2.3 * mix(nx.x, nx.y, fadeXY.y);\n' +
    '}\n' +
    '\n' +
    'float fbm(vec2 p) {\n' +
    '  float value = 0.0;\n' +
    '  float amp = 1.0;\n' +
    '  for (int i = 0; i < 4; i++) {\n' +
    '    value += amp * abs(cnoise(p));\n' +
    '    p *= uWaveFrequency;\n' +
    '    amp *= uWaveAmplitude;\n' +
    '  }\n' +
    '  return value;\n' +
    '}\n' +
    '\n' +
    'float pattern(vec2 p) {\n' +
    '  vec2 p2 = p - uTime * uWaveSpeed;\n' +
    '  return fbm(p + fbm(p2));\n' +
    '}\n' +
    '\n' +
    'void main() {\n' +
    '  vec2 corner = (gl_FragCoord.xy - 0.5) * uCell;\n' +
    '  vec2 uv = corner / uResolution - 0.5;\n' +
    '  uv.x *= uResolution.x / uResolution.y;\n' +
    '\n' +
    '  float touch = 0.0;\n' +
    '  for (int i = 0; i < ' + MAX_TRAIL + '; i++) {\n' +
    '    if (i >= uTrailCount) break;\n' +
    '    vec3 point = uTrail[i];\n' +
    '    float reach = uRadius * mix(0.55, 1.0, point.z);\n' +
    '    touch = max(touch, point.z * (1.0 - smoothstep(0.0, reach, length(uv - point.xy))));\n' +
    '  }\n' +
    '\n' +
    '  vec2 warp = vec2(0.0);\n' +
    '  float ring = 0.0;\n' +
    '  for (int i = 0; i < ' + MAX_RIPPLES + '; i++) {\n' +
    '    if (i >= uRippleCount) break;\n' +
    '    vec4 ripple = uRipples[i];\n' +
    '    vec2 delta = uv - ripple.xy;\n' +
    '    float dist = length(delta);\n' +
    '    float life = clamp(ripple.z / ' + RIPPLE_SECONDS.toFixed(2) + ', 0.0, 1.0);\n' +
    '    float wave = exp(-pow((dist - ripple.z * 0.9) / 0.07, 2.0)) * (1.0 - life) * (1.0 - life) * ripple.w;\n' +
    '    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * wave * 0.035;\n' +
    '    ring += wave;\n' +
    '  }\n' +
    '\n' +
    '  if (uEffect == 2 && touch > 0.0) {\n' +
    '    vec3 head = uTrail[0];\n' +
    '    vec2 delta = uv - head.xy;\n' +
    '    float dist = length(delta);\n' +
    '    warp += (dist > 0.0001 ? delta / dist : vec2(0.0)) * sin(dist / max(uRadius, 0.001) * 16.0 - uTime * 7.0) * 0.04 * touch * uStrength;\n' +
    '  }\n' +
    '\n' +
    '  float f = pattern((uv + warp) / uScale);\n' +
    '  if (uEffect == 0) f -= 0.5 * touch * uStrength;\n' +
    '  if (uEffect == 1) f += 0.5 * touch * uStrength;\n' +
    '  f += ring * 0.55;\n' +
    '  f = (f - 0.5) * uContrast + 0.5 + uBrightness;\n' +
    '  float show = clamp((uIntro * uReach - length(uv)) / 0.45, 0.0, 1.0);\n' +
    '  float v = clamp(f, 0.0, 1.0) * show * show * (3.0 - 2.0 * show);\n' +
    '  outColor = vec4(floor(v * 255.0) / 255.0, fract(v * 255.0), 0.0, 1.0);\n' +
    '}\n';

  var DITHER_FRAGMENT =
    '#version 300 es\n' +
    'precision highp float;\n' +
    'precision highp int;\n' +
    'uniform sampler2D uField;\n' +
    'uniform ivec2 uFieldSize;\n' +
    'uniform float uCellDevice;\n' +
    'uniform int uMode;\n' +
    'uniform float uColorNum;\n' +
    'uniform vec3 uWave;\n' +
    'uniform vec3 uBackground;\n' +
    'uniform vec3 uPalette[' + MAX_PALETTE + '];\n' +
    'uniform int uPaletteCount;\n' +
    'uniform float uTransparent;\n' +
    'out vec4 outColor;\n' +
    '\n' +
    'const float bayer8[64] = float[64](\n' +
    '  0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,\n' +
    '  32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,\n' +
    '  8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,\n' +
    '  40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,\n' +
    '  2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,\n' +
    '  34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,\n' +
    '  10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,\n' +
    '  42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0\n' +
    ');\n' +
    '\n' +
    'const float bayer4[16] = float[16](\n' +
    '  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,\n' +
    '  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,\n' +
    '  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,\n' +
    '  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0\n' +
    ');\n' +
    '\n' +
    'const float bayer2[4] = float[4](0.0 / 4.0, 2.0 / 4.0, 3.0 / 4.0, 1.0 / 4.0);\n' +
    '\n' +
    'float threshold(vec2 cell) {\n' +
    '  if (uMode == 1) {\n' +
    '    ivec2 c = ivec2(mod(cell, 4.0));\n' +
    '    return bayer4[c.y * 4 + c.x];\n' +
    '  }\n' +
    '  if (uMode == 2) {\n' +
    '    ivec2 c = ivec2(mod(cell, 2.0));\n' +
    '    return bayer2[c.y * 2 + c.x];\n' +
    '  }\n' +
    '  if (uMode == 3) {\n' +
    '    vec2 r = vec2(cell.x + cell.y, cell.x - cell.y) * 0.70710678 / 4.0;\n' +
    '    return clamp(length(fract(r) - 0.5) * 1.41421356, 0.0, 0.999);\n' +
    '  }\n' +
    '  if (uMode == 4) {\n' +
    '    return abs(fract(cell.y / 4.0) - 0.5) * 2.0 * 0.999;\n' +
    '  }\n' +
    '  if (uMode == 5) {\n' +
    '    float a = abs(fract((cell.x + cell.y) / 6.0) - 0.5) * 2.0;\n' +
    '    float b = abs(fract((cell.x - cell.y) / 6.0) - 0.5) * 2.0;\n' +
    '    return min(a, b) * 0.999;\n' +
    '  }\n' +
    '  if (uMode == 6) {\n' +
    '    return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));\n' +
    '  }\n' +
    '  if (uMode == 7) {\n' +
    '    return 0.25;\n' +
    '  }\n' +
    '  ivec2 c = ivec2(mod(cell, 8.0));\n' +
    '  return bayer8[c.y * 8 + c.x];\n' +
    '}\n' +
    '\n' +
    'vec3 toSrgb(vec3 c) {\n' +
    '  c = clamp(c, 0.0, 1.0);\n' +
    '  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));\n' +
    '}\n' +
    '\n' +
    'void main() {\n' +
    '  vec2 cell = floor(gl_FragCoord.xy / uCellDevice);\n' +
    '  vec4 sampleValue = texelFetch(uField, clamp(ivec2(cell), ivec2(0), uFieldSize - 1), 0);\n' +
    '  float f = sampleValue.r + sampleValue.g / 255.0;\n' +
    '  float t = threshold(cell) - 0.25;\n' +
    '\n' +
    '  if (uPaletteCount > 1) {\n' +
    '    float n = float(uPaletteCount);\n' +
    '    float v = f + t / (n - 1.0);\n' +
    '    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\n' +
    '    int index = int(floor(v * (n - 1.0) + 0.5));\n' +
    '    outColor = vec4(toSrgb(uPalette[index]), 1.0);\n' +
    '    return;\n' +
    '  }\n' +
    '\n' +
    '  float levels = max(uColorNum, 1.01) - 1.0;\n' +
    '  if (uTransparent > 0.5) {\n' +
    '    float v = f + t / levels;\n' +
    '    v = clamp(v - mix(0.2, 0.0, smoothstep(0.45, 0.8, v)), 0.0, 1.0);\n' +
    '    float a = floor(v * levels + 0.5) / levels;\n' +
    '    outColor = vec4(toSrgb(uWave) * a, a);\n' +
    '    return;\n' +
    '  }\n' +
    '\n' +
    '  float base = dot(uBackground, vec3(0.2126, 0.7152, 0.0722));\n' +
    '  vec3 offset = (uWave - vec3(base)) * f + t / levels;\n' +
    '  float luminance = dot(uBackground + offset, vec3(0.2126, 0.7152, 0.0722));\n' +
    '  offset -= mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));\n' +
    '  bool rising = dot(uWave, vec3(0.2126, 0.7152, 0.0722)) >= base;\n' +
    '  float lower = rising ? 0.0 : -max(uBackground.r, max(uBackground.g, uBackground.b));\n' +
    '  float upper = rising ? 1.0 - min(uBackground.r, min(uBackground.g, uBackground.b)) : 0.0;\n' +
    '  offset = floor(clamp(offset, lower, upper) * levels + 0.5) / levels;\n' +
    '  outColor = vec4(toSrgb(uBackground + offset), 1.0);\n' +
    '}\n';

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn('[Dither Shader Error]:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  function link(gl, fragmentSource) {
    var vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    var fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    var program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[Dither Link Error]:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    var uniforms = {};
    var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < count; i++) {
      var info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);
    }
    return { program: program, uniforms: uniforms };
  }

  function toLinear(value) {
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }

  var colorProbeCache = new Map();
  function parseColor(value) {
    if (Array.isArray(value)) return [0, 1, 2].map(function (i) { return clamp(Number(value[i]) || 0, 0, 1); });
    var key = String(value).trim();
    if (colorProbeCache.has(key)) return colorProbeCache.get(key);

    // Fast path for 6-character hex like #120f17 or #bcbcbc
    var hexMatch = key.match(/^#([0-9a-fA-F]{6})$/);
    if (hexMatch) {
      var hex = hexMatch[1];
      var r = parseInt(hex.slice(0, 2), 16) / 255;
      var g = parseInt(hex.slice(2, 4), 16) / 255;
      var b = parseInt(hex.slice(4, 6), 16) / 255;
      var rgb = [toLinear(r), toLinear(g), toLinear(b)];
      colorProbeCache.set(key, rgb);
      return rgb;
    }

    var rgbFallback = [0, 0, 0];
    if (typeof document !== 'undefined') {
      var probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      if (probe) {
        probe.clearRect(0, 0, 1, 1);
        probe.fillStyle = '#000000';
        probe.fillStyle = key;
        probe.fillRect(0, 0, 1, 1);
        var data = probe.getImageData(0, 0, 1, 1).data;
        rgbFallback = [toLinear(data[0] / 255), toLinear(data[1] / 255), toLinear(data[2] / 255)];
      }
    }
    colorProbeCache.set(key, rgbFallback);
    return rgbFallback;
  }

  /**
   * Creates and mounts the React Bits Dither WebGL2 background on container
   */
  function createDither(container, options) {
    if (!container) return null;

    options = options || {};

    // Standard Bilva Solution CTA configuration
    var settings = {
      waveSpeed: options.waveSpeed !== undefined ? options.waveSpeed : 0,
      waveFrequency: options.waveFrequency !== undefined ? options.waveFrequency : 3,
      waveAmplitude: options.waveAmplitude !== undefined ? options.waveAmplitude : 0.34,
      waveColor: options.waveColor || '#bcbcbc',
      backgroundColor: options.backgroundColor || '#120f17',
      colorNum: Math.max(2, options.colorNum !== undefined ? options.colorNum : 4),
      pixelSize: Math.max(1, options.pixelSize !== undefined ? options.pixelSize : 2),
      disableAnimation: options.disableAnimation !== undefined ? options.disableAnimation : true,
      enableMouseInteraction: options.enableMouseInteraction !== undefined ? options.enableMouseInteraction : false,
      mouseRadius: Math.max(0.001, options.mouseRadius !== undefined ? options.mouseRadius : 0.05),
      mode: MODES[options.ditherMode] !== undefined ? MODES[options.ditherMode] : 0,
      palette: Array.isArray(options.palette) ? options.palette.filter(Boolean).slice(0, MAX_PALETTE) : [],
      scale: Math.max(0.05, options.scale !== undefined ? options.scale : 0.3),
      contrast: options.contrast !== undefined ? options.contrast : 1,
      brightness: options.brightness !== undefined ? options.brightness : -0.03,
      effect: EFFECTS[options.mouseEffect] !== undefined ? EFFECTS[options.mouseEffect] : 0,
      mouseStrength: Math.max(0, options.mouseStrength !== undefined ? options.mouseStrength : 0),
      trail: clamp(options.trail !== undefined ? options.trail : 0, 0, 1),
      clickRipple: options.clickRipple !== undefined ? options.clickRipple : false,
      intro: options.intro !== undefined ? options.intro : false,
      dpr: options.dpr,
    };

    // Locate or create canvas element
    var canvas = container.querySelector('canvas.dither-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'dither-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);
    }

    var gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });

    if (!gl) {
      console.warn('WebGL2 not supported, fallback to CSS background color.');
      return {
        destroy: function () {
          if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        },
      };
    }

    var wave = link(gl, WAVE_FRAGMENT);
    var dither = link(gl, DITHER_FRAGMENT);
    if (!wave || !dither) {
      console.warn('Failed to compile or link Dither shaders.');
      return null;
    }

    var buffer = gl.createBuffer();
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var field = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, field);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var framebuffer = gl.createFramebuffer();

    var reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var view = { width: 1, height: 1, ratio: 1, cell: 1, cellCss: 1, cols: 1, rows: 1 };
    var trailData = new Float32Array(MAX_TRAIL * 3);
    var rippleData = new Float32Array(MAX_RIPPLES * 4);
    var paletteData = new Float32Array(MAX_PALETTE * 3);

    var state = {
      time: 0,
      reveal: settings.intro && !reduce ? 0 : 1,
    };

    var raf = 0;
    var last = 0;
    var visible = true;
    var destroyed = false;

    var allocate = function () {
      view.cell = Math.max(1, Math.round(settings.pixelSize * view.ratio));
      view.cellCss = view.cell / view.ratio;
      view.cols = Math.max(1, Math.ceil(canvas.width / view.cell));
      view.rows = Math.max(1, Math.ceil(canvas.height / view.cell));

      gl.bindTexture(gl.TEXTURE_2D, field);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, view.cols, view.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    var render = function () {
      if (destroyed) return;
      var expected = Math.max(1, Math.round(settings.pixelSize * view.ratio));
      if (expected !== view.cell) allocate();

      var eased = settings.intro && !reduce ? state.reveal * state.reveal * (3 - 2 * state.reveal) : 1;

      // Pass 1: Wave Simulation to Field Texture
      gl.bindVertexArray(vao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, view.cols, view.rows);
      gl.useProgram(wave.program);
      var w = wave.uniforms;
      gl.uniform2f(w.uResolution, canvas.width / view.ratio, canvas.height / view.ratio);
      gl.uniform1f(w.uCell, view.cellCss);
      gl.uniform1f(w.uTime, state.time);
      gl.uniform1f(w.uWaveSpeed, settings.waveSpeed);
      gl.uniform1f(w.uWaveFrequency, settings.waveFrequency);
      gl.uniform1f(w.uWaveAmplitude, settings.waveAmplitude);
      gl.uniform1f(w.uScale, settings.scale);
      gl.uniform1f(w.uContrast, settings.contrast);
      gl.uniform1f(w.uBrightness, settings.brightness);
      gl.uniform1i(w.uEffect, settings.effect);
      gl.uniform1f(w.uRadius, settings.mouseRadius);
      gl.uniform1f(w.uStrength, settings.mouseStrength);
      gl.uniform3fv(w.uTrail, trailData);
      gl.uniform1i(w.uTrailCount, 0);
      gl.uniform4fv(w.uRipples, rippleData);
      gl.uniform1i(w.uRippleCount, 0);
      gl.uniform1f(w.uIntro, eased);
      gl.uniform1f(w.uReach, 0.5 * Math.hypot(view.width / view.height, 1) + 0.45);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Pass 2: Dither Quantization to Screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(dither.program);
      var d = dither.uniforms;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, field);
      gl.uniform1i(d.uField, 0);
      gl.uniform2i(d.uFieldSize, view.cols, view.rows);
      gl.uniform1f(d.uCellDevice, view.cell);
      gl.uniform1i(d.uMode, settings.mode);
      gl.uniform1f(d.uColorNum, settings.colorNum);
      gl.uniform3fv(d.uWave, parseColor(settings.waveColor));
      var transparent = settings.backgroundColor === 'transparent';
      gl.uniform3fv(d.uBackground, transparent ? [0, 0, 0] : parseColor(settings.backgroundColor));
      gl.uniform1f(d.uTransparent, transparent ? 1 : 0);
      settings.palette.forEach(function (value, index) {
        paletteData.set(parseColor(value), index * 3);
      });
      gl.uniform3fv(d.uPalette, paletteData);
      gl.uniform1i(d.uPaletteCount, settings.palette.length);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    var frame = function (now) {
      raf = 0;
      if (destroyed || !visible || (typeof document !== 'undefined' && document.hidden)) return;
      var dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;
      last = now;

      if (!settings.disableAnimation && !reduce) {
        state.time += dt;
      }

      if (!settings.intro || reduce) {
        state.reveal = 1;
      } else if (state.reveal < 1) {
        state.reveal = Math.min(1, state.reveal + dt / 1.8);
      }

      render();

      var busy = !settings.disableAnimation || state.reveal < 1;
      if (busy && !reduce) {
        raf = requestAnimationFrame(frame);
      } else {
        last = 0;
      }
    };

    var wake = function () {
      if (!raf && visible && typeof document !== 'undefined' && !document.hidden) {
        raf = requestAnimationFrame(frame);
      }
    };

    var resize = function () {
      if (destroyed || !container) return;
      var width = Math.max(1, container.clientWidth);
      var height = Math.max(1, container.clientHeight);
      var ratio = Math.min(settings.dpr || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1), 2);
      view.width = width;
      view.height = height;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      view.ratio = canvas.width / width;
      allocate();
      render();
      if (!settings.disableAnimation || state.reveal < 1) {
        wake();
      }
    };

    var resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    }

    var intersectionObserver = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(function (entries) {
        visible = entries.some(function (entry) { return entry.isIntersecting; });
        if (visible) {
          last = 0;
          render();
          if (!settings.disableAnimation || state.reveal < 1) {
            wake();
          }
        }
      });
      intersectionObserver.observe(container);
    }

    var onVisibility = function () {
      last = 0;
      if (typeof document !== 'undefined' && !document.hidden && visible) {
        render();
        if (!settings.disableAnimation || state.reveal < 1) {
          wake();
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }

    // Trigger initial dimension allocation and render
    resize();

    return {
      render: render,
      resize: resize,
      destroy: function () {
        destroyed = true;
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        if (resizeObserver) resizeObserver.disconnect();
        if (intersectionObserver) intersectionObserver.disconnect();
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', onVisibility);
        }
        gl.deleteProgram(wave.program);
        gl.deleteProgram(dither.program);
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
        gl.deleteTexture(field);
        gl.deleteFramebuffer(framebuffer);
        var loseCtx = gl.getExtension('WEBGL_lose_context');
        if (loseCtx) loseCtx.loseContext();
      },
    };
  }

  /**
   * Auto-initialize Dither on all .solution-cta__dither containers
   */
  function initSolutionCtaDither() {
    var containers = document.querySelectorAll('.solution-cta__dither, [data-dither-cta]');
    containers.forEach(function (container) {
      if (container.dataset.ditherInitialized) return;
      container.dataset.ditherInitialized = 'true';
      createDither(container, {
        backgroundColor: '#120f17',
        waveColor: '#bcbcbc',
        colorNum: 4,
        pixelSize: 2,
        waveSpeed: 0,
        waveFrequency: 3,
        waveAmplitude: 0.34,
        enableMouseInteraction: false,
        mouseRadius: 0.05,
        scale: 0.3,
        brightness: -0.03,
        mouseStrength: 0,
        trail: 0,
        disableAnimation: true,
        intro: false,
      });
    });
  }

  exports.createDither = createDither;
  exports.initSolutionCtaDither = initSolutionCtaDither;

  if (typeof window !== 'undefined') {
    window.createDither = createDither;
    window.initSolutionCtaDither = initSolutionCtaDither;

    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSolutionCtaDither);
      } else {
        initSolutionCtaDither();
      }
    }
  }
});
