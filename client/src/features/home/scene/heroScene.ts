import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ColorManagement,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'

/*
 * "Ganga at dusk": the home page hero background.
 *
 *   sky       violet-to-saffron gradient with a low glow behind the ghats
 *   skyline   ghats and temple spires as a distant silhouette, with tiny lamps
 *   water     animated waves, fresnel sheen and a glittering streak of the glow
 *   diyas     floating lamps that ride the waves, with soft reflections
 *   embers    sparks rising slowly from the water; stars twinkle above
 *
 * Shaders write sRGB colours directly (colour management is off for this scene),
 * so the hex values below are exactly what appears on screen.
 */

export interface HeroSceneOptions {
  /** Render one still frame and never animate. */
  reducedMotion: boolean
  /** Called after the first frame is on screen. */
  onReady?: () => void
}

export interface HeroSceneHandle {
  /** Hero scroll progress 0..1 (0 = top of the page). */
  setScroll: (progress: number) => void
  dispose: () => void
}

const SUN_X = 6

const PALETTE = {
  skyTop: '#07051a',
  skyMid: '#2a1852',
  skyLow: '#8a3a52',
  horizon: '#f0763d',
  glow: '#ffb45e',
  waterDeep: '#0b0a24',
  waterSheen: '#3a2a6a',
  skyline: '#120b2b',
  diya: '#ffb347',
  diyaCore: '#fff3d1',
  ember: '#ff9a4d',
  star: '#e9e3ff',
}

const color = (hex: string) => new Color(hex)

// GLSL shared by the water and everything that floats on it, so lamps ride the same waves.
const WAVES = /* glsl */ `
  float wave(vec2 p, float t) {
    return sin(p.x * 0.32 + t * 0.85) * 0.17
      + sin(p.y * 0.52 - t * 1.05 + p.x * 0.18) * 0.13
      + sin((p.x + p.y) * 1.25 + t * 1.6) * 0.035;
  }
`

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const createSky = () => {
  const geometry = new PlaneGeometry(520, 150)
  geometry.translate(0, 70, -90)
  const material = new ShaderMaterial({
    depthWrite: false,
    uniforms: {
      uTop: { value: color(PALETTE.skyTop) },
      uMid: { value: color(PALETTE.skyMid) },
      uLow: { value: color(PALETTE.skyLow) },
      uHorizon: { value: color(PALETTE.horizon) },
      uGlow: { value: color(PALETTE.glow) },
      uSunX: { value: SUN_X * 4 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uMid, uLow, uHorizon, uGlow;
      uniform float uSunX;
      varying vec3 vPos;
      void main() {
        float h = vPos.y;
        vec3 col = mix(uHorizon, uLow, smoothstep(0.0, 9.0, h));
        col = mix(col, uMid, smoothstep(7.0, 30.0, h));
        col = mix(col, uTop, smoothstep(26.0, 80.0, h));
        float d = length(vec2((vPos.x - uSunX) * 0.55, h - 1.0));
        col += uGlow * exp(-d * d * 0.0035) * 0.55;
        col += uGlow * exp(-d * d * 0.05) * 0.35;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  const mesh = new Mesh(geometry, material)
  mesh.renderOrder = -2
  return mesh
}

/**
 * Ghats along the far bank, built as one flat silhouette: stepped ghats, temple
 * spires (shikharas), domes and palace fronts with small chhatri pavilions.
 * Returns the silhouette and the spots where a window or lamp is lit.
 */
const createSkyline = () => {
  const shape = new Shape()
  const left = -160
  const right = 160
  const lamps: number[] = []
  let seed = 11
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const lamp = (lx: number, ly: number) => lamps.push(lx, ly - 0.6, -69.8)

  let x = left
  shape.moveTo(left, -2)
  shape.lineTo(x, 1.4)
  while (x < right) {
    const kind = next()
    const width = 2.6 + next() * 5.5
    const base = 1.0 + next() * 1.6
    const w = (f: number) => x + width * f

    if (kind > 0.6) {
      // Temple: plinth, then a curved shikhara narrowing to a finial.
      const spire = base + 3.5 + next() * 5.5
      shape.lineTo(x, base)
      shape.lineTo(w(0.18), base)
      shape.lineTo(w(0.18), base + 1)
      shape.bezierCurveTo(w(0.2), base + 3, w(0.4), spire - 1.2, w(0.48), spire)
      shape.lineTo(w(0.5), spire + 1)
      shape.lineTo(w(0.52), spire)
      shape.bezierCurveTo(w(0.6), spire - 1.2, w(0.8), base + 3, w(0.82), base + 1)
      shape.lineTo(w(0.82), base)
      shape.lineTo(x + width, base)
      if (next() > 0.4) lamp(w(0.5), base + 0.6)
    } else if (kind > 0.45) {
      // Dome on a drum.
      const top = base + 1.4 + next() * 1.6
      shape.lineTo(x, base)
      shape.lineTo(w(0.25), base)
      shape.lineTo(w(0.25), top)
      shape.quadraticCurveTo(w(0.25), top + width * 0.42, w(0.5), top + width * 0.45)
      shape.lineTo(w(0.5), top + width * 0.45 + 0.7)
      shape.lineTo(w(0.5), top + width * 0.45)
      shape.quadraticCurveTo(w(0.75), top + width * 0.42, w(0.75), top)
      shape.lineTo(w(0.75), base)
      shape.lineTo(x + width, base)
    } else if (kind > 0.2) {
      // Palace front with a parapet and a small chhatri on one corner.
      const top = base + 1.6 + next() * 2.6
      shape.lineTo(x, top)
      shape.lineTo(w(0.08), top)
      shape.lineTo(w(0.08), top + 0.9)
      shape.quadraticCurveTo(w(0.16), top + 1.9, w(0.24), top + 0.9)
      shape.lineTo(w(0.24), top + 0.35)
      shape.lineTo(x + width, top + 0.35)
      shape.lineTo(x + width, base)
      for (let i = 0, n = Math.floor(next() * 3); i < n; i++) lamp(w(0.3 + next() * 0.6), base + next() * (top - base))
    } else {
      // Ghat steps down to the water.
      shape.lineTo(x, base)
      shape.lineTo(w(0.3), base + 0.25)
      shape.lineTo(w(0.7), base + 0.25)
      shape.lineTo(x + width, base)
    }
    x += width
  }
  shape.lineTo(right, -2)
  shape.lineTo(left, -2)

  const geometry = new ShapeGeometry(shape, 8)
  geometry.translate(0, -0.6, -70)
  const material = new ShaderMaterial({
    uniforms: {
      uColor: { value: color(PALETTE.skyline) },
      uHaze: { value: color(PALETTE.skyLow) },
    },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uHaze;
      varying float vY;
      void main() {
        // A little haze at the waterline gives the bank depth.
        vec3 col = mix(uHaze * 0.55, uColor, smoothstep(-0.6, 3.5, vY));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  const mesh = new Mesh(geometry, material)
  mesh.renderOrder = -1
  return { mesh, lamps: new Float32Array(lamps) }
}

const createWater = (segments: number) => {
  const geometry = new PlaneGeometry(240, 120, segments, Math.round(segments * 0.6))
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, 0, -50)
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCam: { value: new Vector3() },
      uDeep: { value: color(PALETTE.waterDeep) },
      uSheen: { value: color(PALETTE.waterSheen) },
      uGlow: { value: color(PALETTE.glow) },
      uHorizon: { value: color(PALETTE.skyLow) },
      uSunX: { value: SUN_X * 4 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vPos;
      varying vec3 vNormal;
      ${WAVES}
      void main() {
        vec3 p = position;
        float e = 0.15;
        float h = wave(p.xz, uTime);
        float hx = wave(p.xz + vec2(e, 0.0), uTime);
        float hz = wave(p.xz + vec2(0.0, e), uTime);
        p.y = h;
        vNormal = normalize(vec3(h - hx, e, h - hz));
        vPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uSunX;
      uniform vec3 uCam, uDeep, uSheen, uGlow, uHorizon;
      varying vec3 vPos;
      varying vec3 vNormal;
      ${NOISE}
      void main() {
        vec3 V = normalize(uCam - vPos);
        float fres = pow(1.0 - max(dot(vNormal, V), 0.0), 3.0);
        vec3 col = mix(uDeep, uSheen, fres * 0.9);

        // The glow behind the ghats reflected as a long, glittering column.
        float depth = max(-vPos.z, 0.0);
        float spread = 1.4 + depth * 0.09;
        // Centre of the reflection: the line from the camera towards the glow on the sky.
        float centre = uSunX * (uCam.z - vPos.z) / (uCam.z + 90.0);
        float streak = exp(-pow((vPos.x - centre) / spread, 2.0));
        float n = noise(vec2(vPos.x * 2.6, vPos.z * 0.55 + uTime * 0.7));
        float n2 = noise(vec2(vPos.x * 6.0 - uTime * 0.4, vPos.z * 1.4));
        float sparkle = smoothstep(0.6, 0.92, n * 0.65 + n2 * 0.35);
        col += uGlow * streak * (0.18 + fres * 0.35 + sparkle * 0.85);

        vec3 L = normalize(vec3(uSunX, 4.0, -90.0) - vPos);
        vec3 H = normalize(L + V);
        col += uGlow * pow(max(dot(vNormal, H), 0.0), 90.0) * 0.6;

        float dist = length(vPos.xz - uCam.xz);
        col = mix(col, uHorizon * 0.7, smoothstep(14.0, 90.0, dist));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  return new Mesh(geometry, material)
}

interface PointLayerSpec {
  count: number
  fill: (positions: Float32Array, extra: Float32Array, i: number) => void
  vertex: string
  fragment: string
  uniforms: Record<string, { value: unknown }>
}

const createPoints = ({ count, fill, vertex, fragment, uniforms }: PointLayerSpec) => {
  const positions = new Float32Array(count * 3)
  const extra = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) fill(positions, extra, i)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aExtra', new BufferAttribute(extra, 4))
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geometry, material)
  points.frustumCulled = false
  return points
}

/** Seeds per lamp: x, z, phase, drift speed, size. Shared so each reflection stays under its lamp. */
const DIYA_STRIDE = 5

/** Floating diyas. `reflection` draws the stretched glow they cast on the water. */
const diyaLayer = (count: number, scale: { value: number }, reflection: boolean, seeds: Float32Array) =>
  createPoints({
    count,
    fill: (positions, extra, i) => {
      const s = i * DIYA_STRIDE
      positions[i * 3] = seeds[s]!
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = seeds[s + 1]!
      extra[i * 4] = seeds[s + 2]!
      extra[i * 4 + 1] = seeds[s + 3]!
      extra[i * 4 + 2] = seeds[s + 4]!
      extra[i * 4 + 3] = 0
    },
    uniforms: {
      uTime: { value: 0 },
      uScale: scale,
      uColor: { value: color(PALETTE.diya) },
      uCore: { value: color(PALETTE.diyaCore) },
    },
    vertex: /* glsl */ `
      uniform float uTime, uScale;
      attribute vec4 aExtra;
      varying float vFlicker;
      ${WAVES}
      void main() {
        vec3 p = position;
        float range = 34.0 + (-p.z) * 0.9;
        p.x = mod(p.x + uTime * aExtra.y + range * 0.5, range) - range * 0.5;
        p.y = wave(p.xz, uTime) + ${reflection ? '-0.32' : '0.12'};
        vFlicker = 0.82 + 0.18 * sin(uTime * 7.0 + aExtra.x * 17.0) * sin(uTime * 3.1 + aExtra.x * 5.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aExtra.z * uScale * ${reflection ? '2.2' : '1.45'} / -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragment: /* glsl */ `
      uniform vec3 uColor, uCore;
      varying float vFlicker;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        ${
          reflection
            ? `float a = exp(-(c.x * c.x * 60.0 + c.y * c.y * 5.0)) * 0.5;
               gl_FragColor = vec4(uColor * a * vFlicker, a);`
            : `float r = length(c);
               float halo = exp(-r * r * 13.0);
               float core = smoothstep(0.13, 0.02, r);
               vec3 col = uColor * halo * 0.85 + uCore * core;
               gl_FragColor = vec4(col * vFlicker, (halo + core) * vFlicker);`
        }
      }
    `,
  })

export const createHeroScene = (container: HTMLElement, options: HeroSceneOptions): HeroSceneHandle => {
  ColorManagement.enabled = false

  const small = Math.min(container.clientWidth, window.innerWidth) < 768
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2)

  const renderer = new WebGLRenderer({ antialias: !small, alpha: false, powerPreference: 'high-performance' })
  renderer.outputColorSpace = LinearSRGBColorSpace
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(PALETTE.skyTop)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  container.appendChild(canvas)

  const scene = new Scene()
  const camera = new PerspectiveCamera(52, 1, 0.1, 400)

  scene.add(createSky())
  const skyline = createSkyline()
  scene.add(skyline.mesh)
  const water = createWater(small ? 110 : 180)
  scene.add(water)

  const pointScale = { value: 0 }

  // Lamps: denser near the middle of the river, sparser and smaller far away.
  const diyaCount = small ? 34 : 64
  const diyaSeeds = new Float32Array(diyaCount * DIYA_STRIDE)
  for (let i = 0; i < diyaCount; i++) {
    const z = -rand(2.5, 46)
    diyaSeeds.set([rand(-1, 1) * (8 + -z * 0.6), z, Math.random(), rand(0.12, 0.3), rand(0.75, 1.25)], i * DIYA_STRIDE)
  }
  const diyaReflections = diyaLayer(diyaCount, pointScale, true, diyaSeeds)
  const diyas = diyaLayer(diyaCount, pointScale, false, diyaSeeds)
  scene.add(diyaReflections, diyas)

  const embers = createPoints({
    count: small ? 60 : 130,
    fill: (positions, extra, i) => {
      positions[i * 3] = rand(-16, 16)
      positions[i * 3 + 1] = rand(0, 9)
      positions[i * 3 + 2] = -rand(3, 34)
      extra[i * 4] = Math.random()
      extra[i * 4 + 1] = rand(0.18, 0.45)
      extra[i * 4 + 2] = rand(0.4, 1)
      extra[i * 4 + 3] = rand(0.3, 1.2)
    },
    uniforms: { uTime: { value: 0 }, uScale: pointScale, uColor: { value: color(PALETTE.ember) } },
    vertex: /* glsl */ `
      uniform float uTime, uScale;
      attribute vec4 aExtra;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float life = fract(p.y / 9.0 + uTime * aExtra.y * 0.08 + aExtra.x);
        p.y = life * 9.0;
        p.x += sin(uTime * aExtra.w + aExtra.x * 6.28) * 0.6;
        vAlpha = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.55, 1.0, life));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aExtra.z * uScale * 0.28 / -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragment: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, r) * vAlpha;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  })
  scene.add(embers)

  const stars = createPoints({
    count: small ? 140 : 260,
    fill: (positions, extra, i) => {
      positions[i * 3] = rand(-220, 220)
      positions[i * 3 + 1] = rand(20, 120) * (0.6 + Math.random() * 0.4)
      positions[i * 3 + 2] = -88
      extra[i * 4] = Math.random()
      extra[i * 4 + 1] = rand(0.5, 2)
      extra[i * 4 + 2] = rand(0.5, 1.4)
      extra[i * 4 + 3] = 0
    },
    uniforms: { uTime: { value: 0 }, uScale: pointScale, uColor: { value: color(PALETTE.star) } },
    vertex: /* glsl */ `
      uniform float uTime, uScale;
      attribute vec4 aExtra;
      varying float vAlpha;
      void main() {
        vAlpha = (0.45 + 0.55 * sin(uTime * aExtra.y + aExtra.x * 40.0)) * smoothstep(18.0, 40.0, position.y);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.0, aExtra.z * uScale * 1.6 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragment: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.1, r) * vAlpha;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  })
  scene.add(stars)

  // Lit windows and lamps on the far bank.
  const windows = createPoints({
    count: skyline.lamps.length / 3,
    fill: (positions, extra, i) => {
      positions.set(skyline.lamps.subarray(i * 3, i * 3 + 3), i * 3)
      extra[i * 4] = Math.random()
      extra[i * 4 + 1] = rand(0.6, 1.8)
      extra[i * 4 + 2] = rand(0.6, 1.1)
      extra[i * 4 + 3] = 0
    },
    uniforms: { uTime: { value: 0 }, uScale: pointScale, uColor: { value: color(PALETTE.diya) } },
    vertex: /* glsl */ `
      uniform float uTime, uScale;
      attribute vec4 aExtra;
      varying float vAlpha;
      void main() {
        vAlpha = 0.75 + 0.25 * sin(uTime * aExtra.y + aExtra.x * 30.0);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.5, aExtra.z * uScale * 0.9 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragment: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, r) * vAlpha;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  })
  scene.add(windows)

  const timed = [water, diyas, diyaReflections, embers, stars, windows].map(
    (object) => (object.material as ShaderMaterial).uniforms.uTime!,
  )
  const camUniform = (water.material as ShaderMaterial).uniforms.uCam!

  // --- Camera, parallax and sizing ------------------------------------------

  const pointer = { x: 0, y: 0 }
  const eased = { x: 0, y: 0, scroll: 0 }
  let scroll = 0
  let lookY = 1.6
  const lookAt = new Vector3()

  const resize = () => {
    const width = container.clientWidth || 1
    const height = container.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Portrait screens get a wider lens so the river, skyline and sky all still fit.
    camera.fov = camera.aspect < 1 ? 66 : camera.aspect < 1.4 ? 58 : 50
    // Tall screens tilt down a little so the river and its lamps fill the frame, not empty sky.
    lookY = camera.aspect < 0.8 ? -5 : camera.aspect < 1.3 ? -1.2 : 1.6
    camera.updateProjectionMatrix()
    pointScale.value = height * pixelRatio * 0.55
  }

  const place = (t: number) => {
    const sway = reduced ? 0 : Math.sin(t * 0.12) * (coarse ? 0.7 : 0.25)
    camera.position.set(eased.x * 1.1 + sway, 1.55 + eased.y * 0.35 + eased.scroll * 1.4, 9)
    lookAt.set(eased.x * 0.6 + sway * 0.5, lookY + eased.y * 0.4 - eased.scroll * 0.6, -40)
    camera.lookAt(lookAt)
    camUniform.value.copy(camera.position)
  }

  const reduced = options.reducedMotion
  let frame = 0
  let running = false
  let visible = true
  let elapsed = reduced ? 14 : 0
  let last = performance.now()
  let ready = false

  const draw = () => {
    for (const uniform of timed) uniform.value = elapsed
    place(elapsed)
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      options.onReady?.()
    }
  }

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick)
    // Clamp the step so a backgrounded tab does not jump ahead.
    elapsed += Math.min((now - last) / 1000, 0.05)
    last = now
    eased.x += (pointer.x - eased.x) * 0.045
    eased.y += (pointer.y - eased.y) * 0.045
    eased.scroll += (scroll - eased.scroll) * 0.08
    draw()
  }

  const start = () => {
    if (running || reduced || !visible || document.hidden) return
    running = true
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }

  const stop = () => {
    running = false
    cancelAnimationFrame(frame)
  }

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
  }

  // On phones, dragging across the hero nudges the view a little.
  const onTouch = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    pointer.x = ((touch.clientX / window.innerWidth) * 2 - 1) * 0.8
  }
  const onTouchEnd = () => {
    pointer.x = 0
  }

  const onVisibility = () => (document.hidden ? stop() : start())

  const resizeObserver = new ResizeObserver(() => {
    resize()
    if (!running) draw()
  })
  resizeObserver.observe(container)

  const intersection = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting)
    if (visible) start()
    else stop()
  })
  intersection.observe(container)

  window.addEventListener('pointermove', onPointer, { passive: true })
  container.addEventListener('touchmove', onTouch, { passive: true })
  container.addEventListener('touchend', onTouchEnd, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)

  resize()
  draw()
  start()

  return {
    setScroll: (progress) => {
      scroll = Math.min(Math.max(progress, 0), 1)
      if (reduced) {
        eased.scroll = scroll
        draw()
      }
    },
    dispose: () => {
      stop()
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', onPointer)
      container.removeEventListener('touchmove', onTouch)
      container.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('visibilitychange', onVisibility)
      scene.traverse((object) => {
        const mesh = object as Mesh
        mesh.geometry?.dispose()
        const material = mesh.material as ShaderMaterial | undefined
        material?.dispose()
      })
      renderer.dispose()
      canvas.remove()
    },
  }
}
