// ERAS: data-driven table. Each entry = year, palette, fog, sky, lights, enemy roster, music hook, quips and a
// `build()` that makes the era's props/skins. To add a year: add an entry (and any new enemy types in main.js ENEMY_TYPES).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const merge = list => mergeGeometries(list.map(g => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; }));
import { rnd, pick, std, glow, additive, Tex, rimify } from './util.js';
import { colliders, ARENA_R } from './world.js';

const freeSpot = (minR, maxR, pad = 1.5) => {
  for (let k = 0; k < 40; k++) {
    const a = Math.random() * Math.PI * 2, r = rnd(minR, maxR), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!colliders.some(b => x > b.min.x - pad && x < b.max.x + pad && z > b.min.z - pad && z < b.max.z + pad)) return new THREE.Vector3(x, 0, z);
  }
  return new THREE.Vector3(0, 0, ARENA_R);
};
const boxGeo = (x, y, z, w, h, d, ry = 0) => { const g = new THREE.BoxGeometry(w, h, d); g.rotateY(ry); g.translate(x, y + h / 2, z); return g; };

export const ERAS = {
  1985: {
    year: 1985, name: 'NEON CITY', tagline: 'SYNTHWAVE NIGHTS',
    palette: { accent: '#ff2ad4', accent2: '#2af0ff', portal: [0xff2ad4, 0x2af0ff], hud: '#ff5ae8' },
    fog: { color: 0x3a0d4f, density: 0.013 },
    sky: { top: 0x0a0224, horizon: 0xff3a8a, bottom: 0x1a0630, sun: 0xff6ad8, sunOn: 1 },
    lights: { hemi: [0xff7ae0, 0x2a0a4a, 1.0], dir: [0xff9ae8, 1.3, [-20, 30, 10]], exposure: 1.05, bloom: 0.95 },
    roster: { punk85: 4, merc85: 3, ninja85: 3 },   // type: spawn weight
    spawnFx: 'glitch',
    music: null,   // hook: e.g. 'audio/1985.ogg' – loops during this era when set
    quips: { arrive: ['1985. NEON AND SYNTHS.', 'ARCADES! FOCUS, RyOrb.', 'BACK IN THE GOOD OLD DAYS.'], kill: ['STAY IN SCHOOL.', 'GAME OVER, PAL.', 'THE DISC DECIDES.'] },
    build: build1985
  },
  2098: {
    year: 2098, name: 'THE MACHINE WAR', tagline: 'JUDGMENT HAS FALLEN',
    palette: { accent: '#ff2a1a', accent2: '#9ad8ff', portal: [0xff2a1a, 0x9ad8ff], hud: '#ff4a3a' },
    fog: { color: 0x0b0e16, density: 0.02 },
    sky: { top: 0x020308, horizon: 0x3a100a, bottom: 0x050404, sun: 0xff6a2a, sunOn: 0 },
    lights: { hemi: [0x6a7a9a, 0x1a0c0a, 0.85], dir: [0xa8bce8, 1.1, [15, 35, -20]], exposure: 1.3, bloom: 0.8 },
    roster: { drone: 4, sentinel: 5 },
    spawnFx: 'timejump',
    music: null,
    boss: 'omega',   // the final boss lives in this era
    quips: { arrive: ['2098. THE MACHINES WON. NOT FOR LONG.', 'SMELLS LIKE BURNT CHROME.'], kill: ['SCRAP.', 'BACK TO THE FOUNDRY.', 'CHROME BREAKS TOO.'] },
    build: build2098
  }
};
export const ERA_KEYS = Object.keys(ERAS).map(Number);

// ------------------------------------------------------------------------------------------ 1985 props
function build1985() {
  const group = new THREE.Group(), anim = [];
  const grid = Tex.grid(75);
  const groundMat = new THREE.MeshStandardMaterial({ map: grid, emissiveMap: grid, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.6, metalness: 0.3 });
  const layoutMat = new THREE.MeshStandardMaterial({ color: 0x3a1a6a, vertexColors: true, roughness: 0.45, metalness: 0.35, emissive: 0x14062e });
  // skyline: three window textures, merged buildings per texture
  const winCols = [['#ff2ad4', '#ffd0f4'], ['#2af0ff', '#d0faff'], ['#ffe23a', '#ff9a3a']];
  const bgeos = [[], [], []], roofEdges = [];
  for (let i = 0; i < 44; i++) {
    const a = i / 44 * Math.PI * 2 + rnd(-0.03, 0.03), r = rnd(60, 78), w = rnd(7, 13), h = rnd(14, 48);
    const g = boxGeo(Math.cos(a) * r, 0, Math.sin(a) * r, w, h, rnd(7, 12), -a); bgeos[i % 3].push(g);
    if (i % 2 === 0) roofEdges.push(new THREE.EdgesGeometry(g));
  }
  bgeos.forEach((list, i) => {
    const t = Tex.windows(0.35, winCols[i]); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 2);
    group.add(new THREE.Mesh(merge(list), new THREE.MeshStandardMaterial({ color: 0x120a22, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 1.3, roughness: 0.6 })));
  });
  group.add(new THREE.LineSegments(merge(roofEdges), new THREE.LineBasicMaterial({ color: new THREE.Color(0xff2ad4).multiplyScalar(1.5), toneMapped: false })));
  // neon signs (original names)
  const signs = [['NEON NITES', '#ff2ad4'], ['ARCADE', '#2af0ff'], ['VHS RENTAL', '#ffe23a'], ['RAD PIZZA', '#ff6a2a'], ['SYNTH CITY', '#ff2ad4'], ['LASER TAG', '#39ff6a'], ['VIDEO', '#2af0ff'], ['DISCO', '#c86aff'], ['TOTALLY', '#ff2ad4'], ['MALL', '#2af0ff']];
  signs.forEach(([txt, col], i) => {
    const a = i / signs.length * Math.PI * 2 + 0.2, r = 56;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshBasicMaterial({ map: Tex.sign(txt, col), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, color: new THREE.Color(2, 2, 2), side: THREE.DoubleSide }));
    m.position.set(Math.cos(a) * r, rnd(9, 18), Math.sin(a) * r); m.lookAt(0, m.position.y, 0); group.add(m);
    anim.push(t => { m.material.opacity = (Math.sin(t * 13 + i * 7) > 0.97 && i % 3 === 0) ? 0.25 : 1; });
  });
  // wireframe mountains on the horizon
  const mgeo = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = 150, g = new THREE.ConeGeometry(rnd(18, 34), rnd(16, 40), 5, 3); g.translate(Math.cos(a) * r, 8, Math.sin(a) * r); mgeo.push(g); }
  group.add(new THREE.Mesh(merge(mgeo), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xb02ad4).multiplyScalar(1.1), wireframe: true, fog: false, toneMapped: false })));
  // palm trees (instanced-ish: merged)
  const trunk = [], leaf = [];
  for (let i = 0; i < 12; i++) {
    const p = freeSpot(12, ARENA_R - 2, 2.5); let x = p.x, z = p.z, y = 0; const lean = rnd(0, Math.PI * 2);
    for (let k = 0; k < 7; k++) { const g = new THREE.CylinderGeometry(0.16 - k * 0.012, 0.2 - k * 0.012, 1.1, 6); g.translate(x, y + 0.55, z); trunk.push(g); y += 1.05; x += Math.cos(lean) * 0.12 * k * 0.4; z += Math.sin(lean) * 0.12 * k * 0.4; }
    for (let f = 0; f < 7; f++) { const g = new THREE.ConeGeometry(0.35, 3.4, 4); g.scale(1, 1, 0.15); g.translate(0, 1.7, 0); g.rotateX(1.9); g.rotateY(f / 7 * Math.PI * 2); g.translate(x, y, z); leaf.push(g); }
  }
  group.add(new THREE.Mesh(merge(trunk), rimify(std(0x3a1a2a), 0xff2ad4, 1.2)));
  group.add(new THREE.Mesh(merge(leaf), rimify(std(0x0a3a2a, { side: THREE.DoubleSide }), 0x2af0ff, 1.4)));
  // neon arcade cabinets + street lamps near the walls of the arena
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + 0.4, r = ARENA_R + 3, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const lamp = new THREE.Group(); lamp.position.set(x, 0, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 7, 6), std(0x222233, { metalness: 0.8, roughness: 0.3 })); pole.position.y = 3.5; lamp.add(pole);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), glow(i % 2 ? 0x2af0ff : 0xff2ad4, 2.5)); tube.position.set(0, 7, 0); tube.rotation.z = Math.PI / 2; lamp.add(tube);
    lamp.lookAt(0, 0, 0); group.add(lamp);
  }
  // two coloured fill lights
  const l1 = new THREE.PointLight(0xff2ad4, 22, 40, 1.6); l1.position.set(-14, 6, -10); const l2 = new THREE.PointLight(0x2af0ff, 22, 40, 1.6); l2.position.set(14, 6, 12); group.add(l1, l2);
  return { group, groundMat, layoutMat, edges: { color: 0x2af0ff, visible: true }, update(t) { for (const f of anim) f(t); } };
}

// ------------------------------------------------------------------------------------------ 2098 props
function build2098() {
  const group = new THREE.Group(), anim = [];
  const gt = Tex.ground2098(30);
  const groundMat = new THREE.MeshStandardMaterial({ map: gt, roughness: 1, metalness: 0, color: 0x9a9088 });
  const conc = Tex.concrete(); conc.wrapS = conc.wrapT = THREE.RepeatWrapping;
  const layoutMat = new THREE.MeshStandardMaterial({ map: conc, color: 0x8a847c, vertexColors: true, roughness: 0.95 });
  // ruined skyline with jagged tops + girders
  const ruin = [], gird = [];
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * Math.PI * 2 + rnd(-0.03, 0.03), r = rnd(58, 76), w = rnd(7, 12), h = rnd(8, 34), d = rnd(7, 11), x = Math.cos(a) * r, z = Math.sin(a) * r;
    ruin.push(boxGeo(x, 0, z, w, h, d, -a));
    for (let k = 0; k < 3; k++) { const g = boxGeo(0, 0, 0, rnd(1.5, w * 0.5), rnd(2, 7), rnd(1.5, d * 0.6)); g.rotateZ(rnd(-0.4, 0.4)); g.rotateY(-a); g.translate(x + rnd(-3, 3), h - 1, z + rnd(-3, 3)); ruin.push(g); }
    if (i % 2) for (let k = 0; k < 2; k++) { const g = new THREE.BoxGeometry(0.3, rnd(6, 12), 0.3); g.rotateZ(rnd(-0.9, 0.9)); g.rotateX(rnd(-0.5, 0.5)); g.translate(x + rnd(-3, 3), h + 2, z + rnd(-3, 3)); gird.push(g); }
  }
  const ruinMat = new THREE.MeshStandardMaterial({ map: conc, color: 0x4a4644, roughness: 1 });
  group.add(new THREE.Mesh(merge(ruin), ruinMat));
  group.add(new THREE.Mesh(merge(gird), std(0x2a1a14, { metalness: 0.6, roughness: 0.7 })));
  // rubble
  const rub = [];
  for (let i = 0; i < 140; i++) { const p = freeSpot(4, ARENA_R + 6, 0.8), s = rnd(0.2, 1.1); const g = i % 2 ? new THREE.DodecahedronGeometry(s, 0) : new THREE.BoxGeometry(s * 1.6, s * 0.7, s); g.rotateY(rnd(0, 6)); g.rotateX(rnd(-0.5, 0.5)); g.translate(p.x, s * 0.25, p.z); rub.push(g); }
  group.add(new THREE.Mesh(merge(rub), new THREE.MeshStandardMaterial({ map: conc, color: 0x5a5450, roughness: 1, flatShading: true })));
  // skulls (original simple shapes)
  const sk = [], skEye = [];
  for (let i = 0; i < 70; i++) {
    const p = freeSpot(3, ARENA_R + 4, 0.6), ry = rnd(0, 6), s = rnd(0.9, 1.2);
    const c = new THREE.SphereGeometry(0.16 * s, 8, 6); c.scale(1, 0.9, 1.15); c.translate(0, 0.13 * s, 0);
    const j = new THREE.BoxGeometry(0.15 * s, 0.07 * s, 0.12 * s); j.translate(0, 0.03 * s, 0.1 * s);
    for (const g of [c, j]) { g.rotateZ(rnd(-0.5, 0.5)); g.rotateY(ry); g.translate(p.x, 0, p.z); sk.push(g); }
    for (const e of [-1, 1]) { const g = new THREE.SphereGeometry(0.035 * s, 5, 4); g.translate(e * 0.06 * s, 0.13 * s, 0.15 * s); g.rotateY(ry); g.translate(p.x, 0, p.z); skEye.push(g); }
  }
  group.add(new THREE.Mesh(merge(sk), std(0xc8bca0, { roughness: 0.75 })));
  group.add(new THREE.Mesh(merge(skEye), std(0x080605)));
  // wrecked cars
  for (let i = 0; i < 6; i++) {
    const p = freeSpot(10, ARENA_R - 3, 2.5), car = new THREE.Group(), m = std(0x3a2418, { roughness: 0.9, metalness: 0.4 });
    car.position.copy(p); car.rotation.set(rnd(-0.1, 0.1), rnd(0, 6), rnd(-0.25, 0.25));
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.6, 4.2), m); b.position.y = 0.45; car.add(b);
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2), m); c.position.set(0, 0.95, -0.3); c.rotation.z = 0.15; car.add(c);
    group.add(car);
  }
  // fires: flicker cones + embers + 3 point lights
  const fireSpots = []; for (let i = 0; i < 7; i++) fireSpots.push(freeSpot(9, ARENA_R + 3, 2));
  const flameM = [additive(0xff6a1a, 0.85), additive(0xffc23a, 0.8), additive(0xff2a0a, 0.6)];
  fireSpots.forEach((p, i) => {
    const f = new THREE.Group(); f.position.copy(p); group.add(f);
    const cones = []; for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.35 + k * 0.05, 1.6, 7), flameM[k % 3]); c.position.set(rnd(-0.35, 0.35), 0.7, rnd(-0.35, 0.35)); f.add(c); cones.push(c); }
    const base = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), std(0x1a1210)); base.scale.y = 0.4; f.add(base);
    let light = null; if (i < 3) { light = new THREE.PointLight(0xff7a2a, 40, 22, 1.6); light.position.y = 1.5; f.add(light); }
    anim.push((t) => { cones.forEach((c, k) => { const s = 0.8 + 0.4 * Math.abs(Math.sin(t * (9 + k * 3) + i * 5 + k)); c.scale.set(1 / s, s * 1.2, 1 / s); c.position.y = 0.6 * s; }); if (light) light.intensity = 32 + 14 * Math.sin(t * 17 + i) * Math.sin(t * 7.3); });
  });
  // embers (rising points)
  const EN = 160, ep = new Float32Array(EN * 3), eSeed = [];
  for (let i = 0; i < EN; i++) { const f = fireSpots[i % fireSpots.length]; eSeed.push({ f, ox: rnd(-0.6, 0.6), oz: rnd(-0.6, 0.6), ph: Math.random(), sp: rnd(1.2, 2.4) }); }
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3));
  const embers = new THREE.Points(eg, new THREE.PointsMaterial({ color: 0xff8a2a, size: 0.12, map: Tex.dot(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  embers.frustumCulled = false; group.add(embers);
  anim.push(t => { for (let i = 0; i < EN; i++) { const s = eSeed[i], k = (t * s.sp * 0.25 + s.ph) % 1; ep[i * 3] = s.f.x + s.ox + Math.sin(t * 2 + i) * k; ep[i * 3 + 1] = k * 7; ep[i * 3 + 2] = s.f.z + s.oz + Math.cos(t * 1.7 + i) * k; } eg.attributes.position.needsUpdate = true; });
  // smoke columns
  const smokeTex = Tex.smoke(), smokes = [];
  for (let i = 0; i < 22; i++) {
    const f = fireSpots[i % fireSpots.length], m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0x3a3634, transparent: true, depthWrite: false, opacity: 0.6 }));
    group.add(m); smokes.push({ m, f, ph: Math.random(), sp: rnd(0.05, 0.09), rot: rnd(-0.3, 0.3) });
  }
  anim.push(t => { for (const s of smokes) { const k = (t * s.sp + s.ph) % 1; s.m.position.set(s.f.x + k * 4, 1.5 + k * 16, s.f.z + k * 2); const sc = 2 + k * 6; s.m.scale.set(sc, sc, 1); s.m.material.opacity = 0.35 * Math.sin(k * Math.PI); s.m.material.rotation = t * s.rot; } });
  // searchlight towers sweeping the sky/ground
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2 + 0.5, r = ARENA_R + 8, base = new THREE.Group(); base.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); group.add(base);
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.8, 16, 0.8), std(0x22201e, { metalness: 0.6 })); pole.position.y = 8; base.add(pole);
    const head = new THREE.Group(); head.position.y = 16; base.add(head);
    head.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1, 10), std(0x333030, { metalness: 0.7 })));
    const cg = new THREE.ConeGeometry(5, 60, 24, 1, true); cg.translate(0, -30, 0); cg.rotateX(-Math.PI / 2);
    const beam = new THREE.Mesh(cg, additive(0xc8d8ff, 0.06, { side: THREE.DoubleSide })); head.add(beam);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.55, 12), glow(0xffffff, 4)); lens.position.z = 0.51; head.add(lens);
    anim.push(t => { head.rotation.y = Math.atan2(-base.position.x, -base.position.z) + Math.sin(t * 0.35 + i * 2) * 0.9; head.rotation.x = 0.08 + 0.28 * Math.sin(t * 0.5 + i); });
  }
  // distant red laser fire + explosion flashes on the horizon
  const bolts = []; const boltM = glow(0xff1a10, 4);
  for (let i = 0; i < 10; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 3.5), boltM); b.visible = false; group.add(b); bolts.push({ b, v: new THREE.Vector3(), life: 0 }); }
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: Tex.dot(), color: 0xff7a2a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
  group.add(flash); let flashT = 0, last = 0;
  const update = (t, dt, sky) => {
    for (const f of anim) f(t);
    dt = Math.min(0.05, t - last); last = t;
    for (const o of bolts) {
      if (o.life <= 0 && Math.random() < dt * 0.9) {
        const a = Math.random() * Math.PI * 2, r = rnd(55, 85); o.b.position.set(Math.cos(a) * r, rnd(4, 28), Math.sin(a) * r);
        const a2 = a + rnd(-1.2, 1.2) + Math.PI * 0.5; o.v.set(Math.cos(a2), rnd(-0.2, 0.2), Math.sin(a2)).multiplyScalar(rnd(40, 70)); o.life = rnd(0.6, 1.4); o.b.visible = true;
        o.b.lookAt(o.b.position.clone().add(o.v));
      }
      if (o.life > 0) { o.life -= dt; o.b.position.addScaledVector(o.v, dt); if (o.life <= 0) o.b.visible = false; }
    }
    flashT -= dt;
    if (flashT < -rnd(1.5, 5)) { flashT = 0.5; const a = Math.random() * Math.PI * 2; flash.position.set(Math.cos(a) * 95, rnd(3, 12), Math.sin(a) * 95); const s = rnd(25, 45); flash.scale.set(s, s, 1); }
    flash.material.opacity = Math.max(0, flashT) * 1.6;
    if (sky) sky.material.uniforms.flash.value = Math.max(0, flashT) * 0.25;
  };
  return { group, groundMat, layoutMat, edges: { color: 0x000000, visible: false }, update };
}
