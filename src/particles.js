// ============================================================================
//  The stage: one particle system behind the whole page, a slow solar-wind
//  backdrop, and a layer of far dust for depth.
//  Each particle carries a "from" and a "to" target; scroll picks the pair and
//  how far along the morph is. Particles leave on their own delay and swirl
//  outward on the way, so shapes come apart and re-form instead of fading.
// ============================================================================
import * as THREE from "three";

const PARTICLE_VERT = /* glsl */ `
attribute vec3 from; attribute vec3 to; attribute vec3 cFrom; attribute vec3 cTo; attribute vec4 seed;
// look = (glyph index or -1 for a dot, size): glyph cells are sized in shape units, dots as a multiplier
attribute vec2 lFrom; attribute vec2 lTo;
uniform float uMix, uTime, uSize, uPixel, uScatter, uScaleA, uScaleB, uPointerR, uLift, uWorldPx;
uniform vec3 uOffA, uOffB; uniform mat3 uRotA, uRotB; uniform vec2 uPointer;
varying vec3 vColor; varying float vAlpha; varying float vGlyph;
float hash(float n){ return fract(sin(n) * 43758.5453); }

void main(){
  float delay = seed.w * .45;
  float k = smoothstep(delay, delay + .55, uMix);
  vec3 a = uRotA * from * uScaleA + uOffA;
  vec3 b = uRotB * to * uScaleB + uOffB;
  vec3 p = mix(a, b, k);
  float S = mix(uScaleA, uScaleB, k);

  // mid-flight: push out along the particle's own direction and twist around z
  float flight = sin(k * 3.14159) * uScatter;
  p += seed.xyz * flight * S * .7;
  float tw = flight * (seed.w - .5) * .9;
  p.xy = mat2(cos(tw), -sin(tw), sin(tw), cos(tw)) * p.xy;

  // idle breathing, barely there for glyphs so their rows stay readable
  vec2 L = k < .5 ? lFrom : lTo;
  p += vec3(sin(uTime * .8 + seed.w * 37.), cos(uTime * .7 + seed.w * 23.), sin(uTime * .6 + seed.w * 11.)) * S * (L.x >= 0. ? .0004 : .003);
  // scroll velocity lifts particles a little
  p.y += uLift * S * (.0003 + seed.w * .0012);

  // the pointer pushes particles away and towards the camera
  vec2 d = p.xy - uPointer; float dist = length(d);
  float f = uPointerR > 1. ? smoothstep(uPointerR, 0., dist) : 0.;
  p.xy += d / (dist + .001) * f * uPointerR * .5;
  p.z += f * uPointerR * .5;

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  vColor = mix(cFrom, cTo, k) * (1. + f * .7);
  // glyphs hold their shape only at rest; in flight they travel as dots
  vGlyph = L.x >= 0. && sin(k * 3.14159) < .5 ? min(15., L.x + floor(f * 6.)) : -1.;
  if (vGlyph >= 0. && uScatter > 0.) {
    // landing glyphs decode through random characters before they settle,
    // and a few keep flickering at rest
    float tick = floor(uTime * 16.);
    if (k > .5 && k < .999) vGlyph = floor(hash(seed.w * 97. + tick) * 16.);
    else if (hash(seed.w * 131. + floor(uTime * 2.5)) > .993) vGlyph = floor(hash(seed.w * 57. + tick) * 16.);
  }
  if (vGlyph >= 0.) {
    gl_PointSize = L.y * S * uWorldPx * (1000. / -mv.z);
    vAlpha = .8 + .2 * seed.w;
  } else {
    gl_PointSize = L.x < -1.5
      ? uPixel * L.y * (1000. / -mv.z) * (1. + flight * .5)
      : uSize * uPixel * (.5 + seed.w) * (1000. / -mv.z) * (1. + flight * .5) * (L.x >= 0. ? 1. : L.y);
    vAlpha = L.x < -1.5 ? .9 : .55 + .45 * seed.w;
  }
}`;

const PARTICLE_FRAG = /* glsl */ `
uniform sampler2D uAtlas;
varying vec3 vColor; varying float vAlpha; varying float vGlyph;
void main(){
  if (vGlyph >= 0.) {
    float g = floor(vGlyph + .5);
    vec2 cell = vec2(mod(g, 4.), floor(g / 4.));
    float a = texture2D(uAtlas, (cell + gl_PointCoord) / 4.).a;
    if (a < .04) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
    return;
  }
  float r = length(gl_PointCoord - .5);
  if (r > .5) discard;
  float core = smoothstep(.5, .0, r);
  gl_FragColor = vec4(vColor * (.8 + core * .4), core * core * vAlpha + core * .25 * vAlpha);
}`;

// Backdrop: domain-warped noise streaming away from a sun above the frame
const WIND_FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uScroll; uniform vec3 uTint; uniform vec2 uRes;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.743); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .55; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.1 + 7.3; a *= .48; } return v; }
void main(){
  vec2 uv = vUv;
  vec2 p = (uv - vec2(.5, 1.15)) * vec2(uRes.x / uRes.y, 1.);
  float r = length(p), ang = atan(p.y, p.x);
  float t = uTime * .035;
  // polar coordinates make the noise stream outward like a solar wind
  vec2 q = vec2(ang * 2.2, r * 2.4 - t * 2. + uScroll * 1.5);
  float w = fbm(q + fbm(q * 1.7 + t));
  vec3 base = vec3(.03, .033, .045);
  vec3 col = base + uTint * pow(w, 1.8) * 1.6;
  col += vec3(1., .56, .2) * pow(max(0., 1. - r * .9), 4.) * .14;
  col *= 1. - length(uv - .5) * .6;
  gl_FragColor = vec4(col, 1.);
}`;
const FULLSCREEN_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

const DUST_VERT = /* glsl */ `
uniform float uPixel, uScroll, uTime; attribute float s;
void main(){
  vec3 p = position;
  p.y = mod(p.y + uScroll * (160. + s * 280.) + 900., 1800.) - 900.;
  p.x += sin(uTime * .12 + s * 25.) * 6.;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1. + s * 1.4) * uPixel * (1000. / -mv.z);
}`;
const DUST_FRAG = `void main(){ if (length(gl_PointCoord - .5) > .5) discard; gl_FragColor = vec4(.85, .82, .78, .18); }`;

export function createStage(canvas, { count, maxPixel, tier, reduce }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
      depth: false,
      stencil: false,
    });
  } catch {
    canvas.style.display = "none";
    return null;
  }
  renderer.autoClear = false;

  const camera = new THREE.PerspectiveCamera(35, 1, 10, 5000);
  camera.position.z = 1000;
  const scene = new THREE.Scene();

  // backdrop renders small and is stretched up; it is soft enough not to show it
  const windScene = new THREE.Scene(),
    flat = new THREE.Camera();
  const wind = new THREE.ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: WIND_FRAG,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uTint: { value: new THREE.Color() },
      uRes: { value: new THREE.Vector2(1, 1) },
    },
  });
  windScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), wind));
  const windTarget = new THREE.WebGLRenderTarget(64, 64, {
    depthBuffer: false,
  });
  const blitScene = new THREE.Scene();
  blitScene.add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: FULLSCREEN_VERT,
        depthTest: false,
        depthWrite: false,
        fragmentShader:
          "uniform sampler2D map; varying vec2 vUv; void main(){ gl_FragColor = texture2D(map, vUv); }",
        uniforms: { map: { value: windTarget.texture } },
      }),
    ),
  );

  // far dust
  const DN = [500, 900, 1500][tier];
  const dPos = new Float32Array(DN * 3),
    dS = new Float32Array(DN);
  for (let i = 0; i < DN; i++) {
    dPos[i * 3] = (Math.random() - 0.5) * 2600;
    dPos[i * 3 + 1] = (Math.random() - 0.5) * 1800;
    dPos[i * 3 + 2] = -300 - Math.random() * 1500;
    dS[i] = Math.random();
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute("s", new THREE.BufferAttribute(dS, 1));
  const dust = new THREE.ShaderMaterial({
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uPixel: { value: 1 },
      uScroll: { value: 0 },
      uTime: { value: 0 },
    },
  });
  const dustPoints = new THREE.Points(dGeo, dust);
  dustPoints.frustumCulled = false;
  scene.add(dustPoints);

  // the particles
  const geo = new THREE.BufferGeometry();
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1,
      th = Math.random() * Math.PI * 2,
      s = Math.sqrt(1 - u * u),
      r = 0.3 + Math.random() * 0.7;
    seed.set(
      [Math.cos(th) * s * r, u * r, Math.sin(th) * s * r, Math.random()],
      i * 4,
    );
  }
  for (const k of ["from", "to", "cFrom", "cTo"])
    geo.setAttribute(
      k,
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
  for (const k of ["lFrom", "lTo"])
    geo.setAttribute(
      k,
      new THREE.BufferAttribute(new Float32Array(count * 2), 2),
    );
  // shapes without a look are plain dots
  const plain = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) plain.set([-1, 1], i * 2);
  geo.setAttribute("seed", new THREE.BufferAttribute(seed, 4));
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(count * 3), 3),
  );
  const mat = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT,
    fragmentShader: PARTICLE_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMix: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: [2.6, 2.4, 2.3][tier] },
      uPixel: { value: 1 },
      uScatter: { value: reduce ? 0 : 1 },
      uScaleA: { value: 1 },
      uScaleB: { value: 1 },
      uOffA: { value: new THREE.Vector3() },
      uOffB: { value: new THREE.Vector3() },
      uRotA: { value: new THREE.Matrix3() },
      uRotB: { value: new THREE.Matrix3() },
      uPointer: { value: new THREE.Vector2(1e4, 1e4) },
      uPointerR: { value: 0 },
      uLift: { value: 0 },
      uWorldPx: { value: 1 },
      uAtlas: { value: null },
    },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  let lost = false,
    pixel = maxPixel,
    drawCount = count,
    frameNo = 0;
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lost = true;
    canvas.style.opacity = "0";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    lost = false;
    canvas.style.opacity = "";
    pair.a = pair.b = null;
  });

  const view = { w: 1, h: 1 };
  function resize() {
    const w = canvas.clientWidth || innerWidth,
      h = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, pixel));
    renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio();
    mat.uniforms.uPixel.value = pr;
    dust.uniforms.uPixel.value = pr;
    wind.uniforms.uRes.value.set(w, h);
    windTarget.setSize(
      Math.max(32, Math.round(w * 0.3)),
      Math.max(32, Math.round(h * 0.3)),
    );
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    view.h = 2 * 1000 * Math.tan(THREE.MathUtils.degToRad(17.5));
    view.w = view.h * (w / h);
    mat.uniforms.uWorldPx.value = (h * pr) / view.h;
  }
  function setAtlas(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    mat.uniforms.uAtlas.value = tex;
  }

  const pair = { a: null, b: null };
  function setShapes(A, B) {
    if (pair.a === A && pair.b === B) return;
    geo.attributes.from.array.set(A.pos);
    geo.attributes.cFrom.array.set(A.col);
    geo.attributes.to.array.set(B.pos);
    geo.attributes.cTo.array.set(B.col);
    geo.attributes.lFrom.array.set(A.look || plain);
    geo.attributes.lTo.array.set(B.look || plain);
    for (const k of ["from", "to", "cFrom", "cTo", "lFrom", "lTo"])
      geo.attributes[k].needsUpdate = true;
    pair.a = A;
    pair.b = B;
  }

  // shed resolution, then some particles, only if the device really struggles.
  // Many laptops cap the browser at 30 fps on battery, so 30 is not "slow".
  const floor = Math.round(count * 0.7);
  let fpsT = performance.now(),
    fpsN = 0,
    slow = 0;
  const startedAt = performance.now();
  function adapt() {
    const now = performance.now();
    fpsN++;
    if (now - fpsT < 1000) return;
    const fps = (fpsN * 1000) / (now - fpsT);
    fpsT = now;
    fpsN = 0;
    if (document.hidden || now - startedAt < 4000) return;
    slow = fps < 28 ? slow + 1 : 0;
    if (slow < 3) return;
    slow = 0;
    if (pixel > 1.25) {
      pixel = Math.max(1.25, pixel - 0.25);
      resize();
    } else if (drawCount > floor) {
      drawCount = Math.max(floor, Math.round(drawCount * 0.85));
      geo.setDrawRange(0, drawCount);
    }
  }

  function render(skipAdapt) {
    if (lost) return;
    if (!skipAdapt) adapt();
    if (tier > 0 || (frameNo++ & 1) === 0) {
      renderer.setRenderTarget(windTarget);
      renderer.render(windScene, flat);
      renderer.setRenderTarget(null);
    }
    renderer.clear();
    renderer.render(blitScene, flat);
    renderer.render(scene, camera);
  }

  return {
    view,
    resize,
    setShapes,
    setAtlas,
    render,
    particles: mat.uniforms,
    wind: wind.uniforms,
    dust: dust.uniforms,
    get lost() {
      return lost;
    },
  };
}
