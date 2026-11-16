// Low-poly models built from primitives. All original designs.
import * as THREE from 'three';
import { std, glow, additive, rimify, part, grp, pick, Tex } from './util.js';

const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sph: new THREE.SphereGeometry(1, 14, 10),
  sphLo: new THREE.SphereGeometry(1, 8, 6),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 10),
  cylLo: new THREE.CylinderGeometry(1, 1, 1, 6),
  cone: new THREE.ConeGeometry(1, 1, 6),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  tor: new THREE.TorusGeometry(1, 0.2, 8, 20),
};
export { G as GEO };
const B = (p, m, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => part(p, G.box, m, x, y, z, rx, ry, rz, sx, sy, sz);
const S = (p, m, x, y, z, r, sy = 1, sz = 1) => part(p, G.sph, m, x, y, z, 0, 0, 0, r, r * sy, r * sz);
const C = (p, m, x, y, z, r, h, rx = 0, ry = 0, rz = 0, r2) => { const mm = part(p, G.cyl, m, x, y, z, rx, ry, rz, r, h, r2 ?? r); return mm; };
const K = (p, m, x, y, z, r, h, rx = 0, ry = 0, rz = 0, geo = G.cone) => part(p, geo, m, x, y, z, rx, ry, rz, r, h, r);

// ---------------------------------------------------------------- the spiked disc shield
export function buildDisc(scale = 1) {
  const g = new THREE.Group(), spin = grp(g);
  const red = glow(0xff2a1a, 2.6), metal = std(0x3a3a40, { metalness: 0.9, roughness: 0.3 }), steel = std(0xc8c8d0, { metalness: 1, roughness: 0.22 });
  part(spin, G.tor, red, 0, 0, 0, Math.PI / 2, 0, 0, 0.3, 0.3, 0.3);
  C(spin, metal, 0, 0, 0, 0.27, 0.05);
  C(spin, red, 0, 0.03, 0, 0.1, 0.03);
  part(spin, G.tor, steel, 0, 0, 0, Math.PI / 2, 0, 0, 0.17, 0.17, 0.12);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2, s = K(spin, steel, Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4, 0.05, 0.22, 0, 0, 0, G.cone4);
    s.rotation.set(0, -a, -Math.PI / 2); s.rotateZ(0.5);
  }
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), additive(0xff2a1a, 0.55, { map: Tex.ring(), side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2; spin.add(halo);
  g.scale.setScalar(scale); g.userData.spin = spin; g.userData.halo = halo;
  return g;
}

// ---------------------------------------------------------------- RyOrb
export function buildHero() {
  const skin = std(0xa65a40, { roughness: 0.55 }), skinDk = std(0x7a3a28, { roughness: 0.6 });
  const leather = std(0x4a2618, { roughness: 0.85 }), rag = std(0x5e2a1c, { roughness: 0.9, side: THREE.DoubleSide });
  const redMetal = std(0x9a1810, { metalness: 0.75, roughness: 0.32 }), darkMetal = std(0x26262c, { metalness: 0.8, roughness: 0.4 });
  const silver = std(0xd0d0d8, { metalness: 1, roughness: 0.2 }), eye = glow(0xff3020, 3), boot = std(0x24140e, { roughness: 0.8 });
  const root = new THREE.Group(), body = grp(root, 0, 0.55, 0), hips = grp(body, 0, 0.43, 0);
  const P = { root, body, hips, hipY: 0.43 };
  // belt + ragged skirt
  B(hips, leather, 0, 0, 0, 0.4, 0.16, 0.26);
  B(hips, silver, 0, 0.0, 0.135, 0.09, 0.07, 0.02);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; K(hips, rag, Math.sin(a) * 0.2, -0.17, Math.cos(a) * 0.13, 0.07, 0.24, Math.PI, a, 0, G.cone4); }
  // legs
  const legs = [];
  for (const side of [-1, 1]) {
    const cyber = side > 0;   // right leg is cyborg
    const hip = grp(hips, side * 0.12, -0.05, 0), knee = grp(hip, 0, -0.44, 0);
    if (cyber) {
      C(hip, redMetal, 0, -0.22, 0, 0.1, 0.44, 0, 0, 0, 0.1); B(hip, redMetal, side * 0.05, -0.2, 0.02, 0.06, 0.3, 0.16);
      part(knee, G.cyl, darkMetal, 0, 0, 0.0, 0, 0, Math.PI / 2, 0.09, 0.24, 0.09); S(knee, redMetal, 0, 0, 0.07, 0.07);
      C(knee, redMetal, 0, -0.22, 0, 0.085, 0.42); C(knee, darkMetal, 0, -0.22, -0.05, 0.03, 0.4);
      B(knee, redMetal, 0, -0.47, 0.05, 0.14, 0.08, 0.28);
    } else {
      C(hip, rag, 0, -0.22, 0, 0.105, 0.44); C(knee, boot, 0, -0.24, 0, 0.085, 0.42);
      B(knee, boot, 0, -0.47, 0.05, 0.14, 0.08, 0.28); S(knee, leather, 0, 0, 0.04, 0.085);
    }
    legs.push({ hip, knee });
  }
  P.legL = legs[0]; P.legR = legs[1];
  // torso
  const chest = grp(hips, 0, 0.1, 0); P.chest = chest;
  B(chest, skin, 0, 0.12, 0, 0.34, 0.24, 0.2);               // abs
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) B(chest, skinDk, s * 0.055, 0.04 + i * 0.07, 0.1, 0.08, 0.05, 0.02);
  B(chest, skin, 0, 0.38, 0, 0.56, 0.3, 0.3);                 // chest
  for (const s of [-1, 1]) B(chest, skin, s * 0.13, 0.38, 0.14, 0.24, 0.2, 0.06, 0.1, 0, 0);
  B(chest, skin, 0, 0.52, -0.02, 0.4, 0.12, 0.26);            // traps
  B(chest, leather, 0, 0.36, 0.0, 0.07, 0.62, 0.34, 0, 0, 0.7);   // cross strap
  B(chest, silver, -0.05, 0.4, 0.16, 0.05, 0.05, 0.02);
  for (let i = 0; i < 5; i++) K(chest, rag, -0.28 + i * 0.03, 0.32 - i * 0.04, -0.1 + i * 0.05, 0.06, 0.2, Math.PI, i, 0.3, G.cone4);
  B(chest, redMetal, -0.33, 0.52, 0, 0.22, 0.12, 0.26, 0, 0, 0.35);   // left pauldron (cyborg side)
  // head
  C(chest, skin, 0, 0.6, 0, 0.08, 0.12);
  const head = grp(chest, 0, 0.7, 0.01); P.head = head;
  S(head, skin, 0, 0.07, 0, 0.14, 1.12, 1.08);
  B(head, skin, 0, -0.03, 0.03, 0.17, 0.1, 0.17);
  B(head, skinDk, 0, 0.08, 0.125, 0.2, 0.04, 0.04);
  part(head, G.tor, silver, 0, 0.11, 0, Math.PI / 2, 0, 0, 0.143, 0.152, 0.12);
  B(head, silver, 0, 0.11, 0.15, 0.06, 0.05, 0.02);
  for (const s of [-1, 1]) { S(head, eye, s * 0.05, 0.05, 0.13, 0.017); S(head, skin, s * 0.14, 0.05, 0, 0.03); }
  // arms
  const mkArm = (side, cyber) => {
    const sh = grp(chest, side * 0.36, 0.48, 0), el = grp(sh, 0, -0.32, 0), hand = grp(el, 0, -0.3, 0);
    if (cyber) {
      S(sh, darkMetal, 0, 0, 0, 0.11); C(sh, redMetal, 0, -0.16, 0, 0.085, 0.3); B(sh, redMetal, side * 0.04, -0.14, 0, 0.06, 0.24, 0.14);
      S(el, darkMetal, 0, 0, 0, 0.075); C(el, redMetal, 0, -0.15, 0, 0.095, 0.28, 0, 0, 0, 0.09);
      for (let i = 0; i < 3; i++) S(el, silver, side * 0.09, -0.06 - i * 0.08, 0, 0.018);
      C(el, glow(0xff2a1a, 2), 0, -0.15, 0.09, 0.012, 0.22);
      B(hand, redMetal, 0, -0.03, 0, 0.11, 0.12, 0.11);
    } else {
      S(sh, skin, 0, -0.02, 0, 0.11); C(sh, skin, 0, -0.16, 0, 0.09, 0.3, 0, 0, 0, 0.075); S(sh, skin, 0, -0.14, 0.04, 0.08);
      C(el, skin, 0, -0.14, 0, 0.075, 0.28, 0, 0, 0, 0.06); C(el, leather, 0, -0.2, 0, 0.08, 0.14);
      for (let i = 0; i < 3; i++) K(el, silver, side * 0.08, -0.15 - i * 0.04, 0, 0.02, 0.08, 0, 0, -side * Math.PI / 2, G.cone4);
      B(hand, skin, 0, -0.03, 0, 0.1, 0.11, 0.1);
    }
    return { sh, el, hand };
  };
  P.armR = mkArm(1, false); P.armL = mkArm(-1, true);
  // disc mount (on right forearm, outer side)
  P.discMount = grp(P.armR.el, 0.11, -0.16, 0); P.discMount.rotation.z = Math.PI / 2;
  // blob shadow
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.45, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; root.add(sh); P.shadow = sh;
  root.traverse(o => { if (o.isMesh && o !== sh) o.castShadow = true; });
  return P;
}

// Walk/run/idle pose helper for anything with legL/legR/armL/armR.
export function animLimbs(P, phase, amt, opt = {}) {
  const s = Math.sin(phase), c = Math.cos(phase);
  P.legL.hip.rotation.x = s * 0.7 * amt; P.legR.hip.rotation.x = -s * 0.7 * amt;
  P.legL.knee.rotation.x = Math.max(0, -c) * 0.9 * amt + (opt.crouch || 0); P.legR.knee.rotation.x = Math.max(0, c) * 0.9 * amt + (opt.crouch || 0);
  if (!opt.noArms) {
    P.armL.sh.rotation.x = -s * 0.6 * amt; P.armR.sh.rotation.x = s * 0.6 * amt;
    P.armL.el.rotation.x = -0.3 - 0.3 * amt; P.armR.el.rotation.x = -0.3 - 0.3 * amt;
  }
  if (P.hips) P.hips.position.y = P.hipY - Math.abs(c) * 0.05 * amt - (opt.crouch || 0) * 0.25;
}

// ---------------------------------------------------------------- generic humanoid for the 1985 crew
function humanoid(m, d = {}) {
  const h = d.h || 1;
  const root = new THREE.Group(), body = grp(root, 0, 0.5 * h, 0), hips = grp(body, 0, 0.42 * h, 0);
  const P = { root, body, hips, hipY: 0.42 * h };
  B(hips, m.pants, 0, 0, 0, 0.32, 0.16, 0.2);
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = grp(hips, side * 0.09, -0.05, 0), knee = grp(hip, 0, -0.42 * h, 0);
    C(hip, m.pants, 0, -0.21 * h, 0, d.leg || 0.08, 0.42 * h); C(knee, m.pants, 0, -0.21 * h, 0, (d.leg || 0.08) * 0.85, 0.42 * h);
    B(knee, m.shoes, 0, -0.44 * h, 0.04, 0.11, 0.07, 0.24);
    legs.push({ hip, knee });
  }
  P.legL = legs[0]; P.legR = legs[1];
  const chest = grp(hips, 0, 0.08, 0); P.chest = chest;
  B(chest, m.shirt, 0, 0.27 * h, 0, 0.38 * (d.bulk || 1), 0.46 * h, 0.22);
  C(chest, m.skin, 0, 0.53 * h, 0, 0.06, 0.1);
  const head = grp(chest, 0, 0.63 * h, 0); P.head = head;
  S(head, m.skin, 0, 0.04, 0, 0.12, 1.1, 1.05);
  const mkArm = side => {
    const sh = grp(chest, side * (0.23 * (d.bulk || 1)), 0.46 * h, 0), el = grp(sh, 0, -0.29 * h, 0), hand = grp(el, 0, -0.27 * h, 0);
    C(sh, m.sleeve || m.shirt, 0, -0.14 * h, 0, 0.065, 0.29 * h); C(el, m.sleeve || m.shirt, 0, -0.13 * h, 0, 0.055, 0.27 * h);
    S(hand, m.skin, 0, -0.02, 0, 0.055);
    return { sh, el, hand };
  };
  P.armR = mkArm(1); P.armL = mkArm(-1);
  return P;
}
const rimMats = (defs, rim) => { const o = {}; for (const k in defs) o[k] = rimify(std(defs[k][0], defs[k][1] || {}), rim, defs[k][2] ?? 2.6); return o; };

export function buildPunk(boombox) {
  const hair = pick([0xff2ad4, 0x39ff6a, 0x2af0ff, 0xffe23a]), rim = pick([0xff2ad4, 0x2af0ff]);
  const m = rimMats({ skin: [0xd8a080], pants: [0x2a3a5a, { roughness: 0.9 }], shoes: [0x111111], shirt: [0x141418, { roughness: 0.35, metalness: 0.2 }], sleeve: [0x141418, { roughness: 0.35, metalness: 0.2 }] }, rim);
  const P = humanoid(m, { bulk: 1.05 });
  const stud = std(0xdddddd, { metalness: 1, roughness: 0.2 });
  for (let i = 0; i < 6; i++) S(P.chest, stud, -0.15 + (i % 3) * 0.15, 0.45, -0.1 + (i > 2 ? 0.21 : 0), 0.02);
  B(P.chest, rimify(std(0xff2a7a), rim), 0, 0.3, 0.112, 0.16, 0.16, 0.01);   // tee showing under jacket
  const hm = glow(hair, 1.8);
  for (let i = 0; i < 6; i++) K(P.head, hm, 0, 0.17 - Math.abs(i - 2.5) * 0.008, -0.1 + i * 0.04, 0.03, 0.22 - Math.abs(i - 2.5) * 0.03, 0.2 - i * 0.12);
  B(P.head, std(0x111111, { metalness: 0.5, roughness: 0.2 }), 0, 0.05, 0.11, 0.16, 0.04, 0.03);
  if (boombox) {
    const bb = grp(P.armR.hand, 0, -0.12, 0.05);
    B(bb, rimify(std(0x9a9aa4, { metalness: 0.7, roughness: 0.3 }), rim), 0, 0, 0, 0.12, 0.26, 0.5);
    for (const z of [-0.14, 0.14]) part(bb, G.cyl, glow(0x2af0ff, 1.2), 0.065, 0, z, 0, 0, Math.PI / 2, 0.09, 0.02, 0.09);
    C(bb, stud, 0, 0.17, 0, 0.012, 0.4, Math.PI / 2, 0, 0);
    P.prop = bb;
  } else {
    const bottle = grp(P.armR.hand, 0, -0.06, 0.03);
    C(bottle, new THREE.MeshStandardMaterial({ color: 0x2aa04a, roughness: 0.1, metalness: 0.1, emissive: 0x0a4018 }), 0, -0.05, 0, 0.035, 0.16); C(bottle, std(0x2aa04a), 0, 0.06, 0, 0.015, 0.08);
    P.prop = bottle;
  }
  return P;
}
export function buildMerc() {
  const suit = pick([0xe87ab8, 0x6ac0c8, 0xc8c0b0, 0xa888e0]), rim = pick([0x2af0ff, 0xff2ad4, 0xffe23a]);
  const m = rimMats({ skin: [0xe0a888], pants: [suit, { roughness: 0.6 }], shoes: [0xf0e8d8], shirt: [suit, { roughness: 0.6 }], sleeve: [suit, { roughness: 0.6 }] }, rim);
  const P = humanoid(m, { bulk: 1.1 });
  B(P.chest, rimify(std(pick([0x3ac8c0, 0xff6a9a, 0xffffff])), rim), 0, 0.3, 0.112, 0.12, 0.4, 0.01);   // pastel tee
  for (const s of [-1, 1]) B(P.chest, m.shirt, s * 0.11, 0.38, 0.12, 0.06, 0.2, 0.01, 0, 0, s * 0.25);   // lapels
  const hairM = rimify(std(pick([0xe8c060, 0x7a4a2a, 0xc89040]), { roughness: 0.8 }), rim);
  S(P.head, hairM, 0, 0.1, -0.02, 0.125, 0.6, 1.05);
  B(P.head, hairM, 0, -0.06, -0.1, 0.2, 0.26, 0.08);     // the mullet
  B(P.head, std(0x050505, { metalness: 0.6, roughness: 0.1 }), 0, 0.05, 0.115, 0.2, 0.05, 0.03);   // shades
  const gun = grp(P.armR.hand, 0, -0.04, 0.06);
  B(gun, std(0x1a1a1a, { metalness: 0.7, roughness: 0.3 }), 0, 0, 0.05, 0.05, 0.08, 0.24); B(gun, std(0x1a1a1a), 0, -0.07, -0.02, 0.04, 0.12, 0.05);
  P.muzzle = grp(gun, 0, 0.01, 0.2); P.prop = gun;
  return P;
}
export function buildNinja() {
  const band = pick([0xff2a5a, 0xff2ad4, 0x2af0ff]), rim = pick([0x2af0ff, 0xff2ad4, 0x9a6aff]);
  const m = rimMats({ skin: [0x16161e], pants: [0x101018, { roughness: 0.9 }], shoes: [0x0a0a0a], shirt: [0x12121a, { roughness: 0.9 }] }, rim, );
  const P = humanoid(m, { bulk: 0.9, leg: 0.07 });
  B(P.head, rimify(std(0xd8a080), rim), 0, 0.05, 0.1, 0.14, 0.04, 0.03);   // eye slit
  const bm = glow(band, 1.8);
  part(P.head, G.tor, bm, 0, 0.08, 0, Math.PI / 2, 0, 0, 0.125, 0.125, 0.1);
  for (let i = 0; i < 2; i++) B(P.head, bm, 0.04 * (i ? 1 : -1), 0.04, -0.2, 0.03, 0.02, 0.22, 0.4, i ? 0.3 : -0.3, 0);
  const sword = grp(P.chest, 0, 0.3, -0.13); sword.rotation.z = 0.7;
  C(sword, std(0x111111), 0, -0.25, 0, 0.02, 0.22); C(sword, std(0xd0d0e0, { metalness: 1, roughness: 0.15 }), 0, 0.12, 0, 0.015, 0.55);
  B(P.chest, bm, 0, 0.06, 0, 0.4, 0.04, 0.24);   // sash
  return P;
}

// ---------------------------------------------------------------- 2098 machines
export const chromeMat = (env) => std(0xd8dce4, { metalness: 1, roughness: 0.22, envMapIntensity: 1.2 });
export function buildSentinel(scale = 1, boss = false) {
  const chrome = std(0xc8ccd6, { metalness: 1, roughness: 0.24 }), dark = std(0x2a2c32, { metalness: 0.9, roughness: 0.4 });
  const eyeM = glow(0xff1a10, 4);
  const root = new THREE.Group(), body = grp(root), hips = grp(body, 0, 1.0, 0);
  const P = { root, body, hips, hipY: 1.0, eyes: [], mats: [chrome, dark] };
  B(hips, chrome, 0, 0, 0, 0.36, 0.12, 0.2); C(hips, dark, 0, 0.12, 0, 0.05, 0.25);
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = grp(hips, side * 0.13, -0.04, 0), knee = grp(hip, 0, -0.46, 0);
    S(hip, dark, 0, 0, 0, 0.07); C(hip, chrome, 0, -0.23, 0, 0.045, 0.44); C(hip, dark, side * 0.05, -0.22, -0.03, 0.02, 0.36);
    S(knee, chrome, 0, 0, 0, 0.065); C(knee, chrome, 0, -0.23, 0, 0.04, 0.44); C(knee, dark, 0, -0.2, 0.05, 0.02, 0.32);
    B(knee, chrome, 0, -0.47, 0.06, 0.12, 0.05, 0.28); for (const t of [-1, 0, 1]) B(knee, chrome, t * 0.04, -0.48, 0.21, 0.025, 0.03, 0.08);
    legs.push({ hip, knee });
  }
  P.legL = legs[0]; P.legR = legs[1];
  const chest = grp(hips, 0, 0.12, 0); P.chest = chest;
  C(chest, chrome, 0, 0.2, 0, 0.045, 0.4);   // spine
  for (let i = 0; i < 4; i++) part(chest, G.tor, chrome, 0, 0.2 + i * 0.08, 0, Math.PI / 2, 0, 0, 0.19 - Math.abs(i - 2) * 0.02, 0.16, 0.12 + i * 0.01);
  B(chest, chrome, 0, 0.5, 0, 0.5, 0.08, 0.2);   // collar bar
  const core = S(chest, glow(0xff2010, boss ? 3 : 1.4), 0, 0.33, 0.06, 0.06); P.core = core;
  for (const s of [-1, 1]) C(chest, dark, s * 0.06, 0.6, 0, 0.018, 0.16);
  const head = grp(chest, 0, 0.72, 0.02); P.head = head;
  S(head, chrome, 0, 0.06, 0, 0.13, 1.05, 1.15);
  B(head, chrome, 0, -0.06, 0.05, 0.16, 0.06, 0.14);
  for (let i = 0; i < 6; i++) B(head, chrome, -0.06 + i * 0.024, -0.03, 0.12, 0.012, 0.03, 0.01);
  B(head, dark, 0, 0.05, 0.12, 0.17, 0.06, 0.04);
  for (const s of [-1, 1]) { const e = S(head, eyeM, s * 0.05, 0.05, 0.135, 0.024); P.eyes.push(e); }
  const mkArm = side => {
    const sh = grp(chest, side * 0.3, 0.46, 0), el = grp(sh, 0, -0.33, 0), hand = grp(el, 0, -0.31, 0);
    S(sh, chrome, 0, 0, 0, 0.08); C(sh, chrome, 0, -0.16, 0, 0.04, 0.32); C(sh, dark, side * 0.04, -0.15, 0, 0.018, 0.28);
    S(el, dark, 0, 0, 0, 0.055); C(el, chrome, 0, -0.15, 0, 0.035, 0.3); C(el, chrome, side * 0.03, -0.15, 0.02, 0.02, 0.3);
    B(hand, chrome, 0, -0.04, 0, 0.08, 0.1, 0.05); for (let f = 0; f < 3; f++) B(hand, chrome, -0.025 + f * 0.025, -0.12, 0.01, 0.015, 0.08, 0.015);
    return { sh, el, hand };
  };
  P.armR = mkArm(1); P.armL = mkArm(-1);
  const gun = grp(P.armR.hand, 0, -0.06, 0.08);
  B(gun, dark, 0, 0, 0.1, 0.08, 0.1, 0.5); C(gun, glow(0xff2010, 2), 0, 0.06, 0.1, 0.012, 0.42, Math.PI / 2, 0, 0); P.muzzle = grp(gun, 0, 0, 0.38);
  if (boss) {
    for (const s of [-1, 1]) {   // shoulder cannons + armour
      const c = grp(chest, s * 0.36, 0.62, 0);
      B(c, dark, 0, 0, 0, 0.22, 0.14, 0.3); C(c, chrome, 0, 0.02, 0.2, 0.05, 0.3, Math.PI / 2, 0, 0); S(c, eyeM, 0, 0.02, 0.36, 0.03);
      P['can' + (s > 0 ? 'R' : 'L')] = grp(c, 0, 0.02, 0.38);
    }
    for (let i = 0; i < 5; i++) K(head, glow(0xff2010, 1.5), -0.1 + i * 0.05, 0.2 - Math.abs(i - 2) * 0.02, -0.02, 0.018, 0.14 - Math.abs(i - 2) * 0.02);
    B(chest, dark, 0, 0.36, 0.0, 0.42, 0.36, 0.26);
    S(chest, glow(0xff2010, 3), 0, 0.36, 0.13, 0.09);
  }
  root.scale.setScalar(scale);
  return P;
}
export function buildDrone() {
  const gun = std(0x2a2c32, { metalness: 0.9, roughness: 0.35 }), plate = std(0x50545c, { metalness: 0.8, roughness: 0.4 });
  const root = new THREE.Group(), body = grp(root); const P = { root, body, fans: [] };
  S(body, plate, 0, 0, 0, 0.55, 0.32, 1.1);
  B(body, gun, 0, 0.12, -0.3, 0.5, 0.18, 0.7);
  for (const s of [-1, 1]) {
    B(body, gun, s * 0.6, 0, 0, 0.6, 0.06, 0.18);
    const pod = grp(body, s * 1.0, 0.05, 0);
    C(pod, plate, 0, 0, 0, 0.32, 0.22, 0, 0, 0, 0.32);
    const fan = grp(pod, 0, 0.0, 0); for (let i = 0; i < 3; i++) B(fan, gun, 0, 0, 0, 0.58, 0.02, 0.08, 0, i * Math.PI / 3, 0);
    S(pod, glow(0xff5020, 1.2), 0, -0.13, 0, 0.12, 0.3, 1);
    P.fans.push(fan);
  }
  C(body, gun, 0, -0.18, 0.7, 0.04, 0.5, Math.PI / 2, 0, 0); P.muzzle = grp(body, 0, -0.18, 0.98);
  S(body, glow(0xff1a10, 4), 0, -0.05, 1.02, 0.09);
  // searchlight: cone pointing forward/down
  const light = grp(root, 0, -0.25, 0); P.light = light;
  const coneGeo = new THREE.ConeGeometry(1.3, 8, 20, 1, true); coneGeo.translate(0, -4, 0);
  const beam = new THREE.Mesh(coneGeo, additive(0xd8e8ff, 0.025, { side: THREE.DoubleSide })); light.add(beam);
  S(light, glow(0xffffff, 3), 0, 0, 0, 0.1);
  return P;
}

// ---------------------------------------------------------------- title dragon
export function buildDragon() {
  const scale = std(0x2c0c0e, { roughness: 0.45, metalness: 0.35 }), belly = std(0x4a1612, { roughness: 0.6 }), horn = std(0x1a1210, { roughness: 0.4, metalness: 0.4 });
  const memb = std(0x4a0a0c, { roughness: 0.7, side: THREE.DoubleSide, emissive: 0x1a0202 }), bone = std(0x200808, { roughness: 0.5 });
  const eye = glow(0xff2010, 5), tooth = std(0xe8dcc8, { roughness: 0.4 }), mouth = glow(0xff3010, 0.8);
  const root = new THREE.Group(); const P = { root, wings: [], neck: [], tail: [] };
  const body = grp(root); P.body = body;
  S(body, scale, 0, 0, 0, 1.3, 0.95, 2.1); S(body, belly, 0, -0.35, 0.2, 1.1, 0.7, 1.7);
  for (let i = 0; i < 9; i++) K(body, horn, 0, 0.85 - Math.abs(i - 3) * 0.06, 1.4 - i * 0.38, 0.12, 0.6 - Math.abs(i - 2) * 0.04, -0.4);
  // neck + head (forward = +z)
  let prev = grp(body, 0, 0.4, 1.7); P.neckBase = prev;
  for (let i = 0; i < 6; i++) {
    const n = grp(prev, 0, 0.2, 0.4); n.rotation.x = -0.1; S(n, scale, 0, 0, 0, 0.52 - i * 0.04, 1, 1.1); K(n, horn, 0, 0.48 - i * 0.03, -0.1, 0.07, 0.45, -0.5);
    P.neck.push(n); prev = n;
  }
  const head = grp(prev, 0, 0.2, 0.45); P.head = head; head.rotation.x = 0.55;
  B(head, scale, 0, 0.05, 0.2, 0.75, 0.55, 1.0);
  part(head, G.cyl, scale, 0, 0.0, 0.95, Math.PI / 2, 0, 0, 0.32, 0.9, 0.22).geometry = new THREE.CylinderGeometry(0.6, 1, 1, 6);
  B(head, scale, 0, 0.3, 0.3, 0.8, 0.12, 0.6, -0.15);     // brow
  const jaw = grp(head, 0, -0.18, 0.2); jaw.rotation.x = 0.45; P.jaw = jaw;
  B(jaw, belly, 0, -0.05, 0.55, 0.6, 0.16, 1.1); B(jaw, mouth, 0, 0.04, 0.5, 0.44, 0.02, 0.9);
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { K(jaw, tooth, s * 0.24, 0.1, 0.15 + i * 0.13, 0.03, 0.14); K(head, tooth, s * 0.27, -0.24, 0.45 + i * 0.12, 0.03, 0.14, Math.PI); }
  for (const s of [-1, 1]) {
    S(head, eye, s * 0.33, 0.2, 0.55, 0.075);
    for (let k = 0; k < 3; k++) K(head, horn, s * (0.25 + k * 0.08), 0.35 + k * 0.05, -0.15 - k * 0.15, 0.08, 0.9 - k * 0.2, -1.1 - k * 0.15, 0, s * -0.4);
  }
  // tail
  prev = grp(body, 0, 0.1, -1.9);
  for (let i = 0; i < 10; i++) { const t = grp(prev, 0, 0, -0.4); t.rotation.x = 0.06; S(t, scale, 0, 0, 0, 0.42 - i * 0.035, 0.9, 1.3); K(t, horn, 0, 0.35 - i * 0.03, 0, 0.06, 0.35, -0.6); P.tail.push(t); prev = t; }
  // legs
  for (const [x, z] of [[-0.9, 1.1], [0.9, 1.1], [-0.95, -1.1], [0.95, -1.1]]) {
    const l = grp(body, x, -0.5, z); l.rotation.x = z > 0 ? -0.6 : 0.5;
    S(l, scale, 0, -0.1, 0, 0.4, 1.3, 0.5); const k = grp(l, 0, -0.7, 0); k.rotation.x = z > 0 ? 1.1 : -0.7;
    C(k, scale, 0, -0.35, 0, 0.2, 0.7); for (let c = -1; c <= 1; c++) K(k, horn, c * 0.1, -0.75, 0.15, 0.04, 0.28, 1.4);
  }
  // wings
  for (const s of [-1, 1]) {
    const w = grp(body, s * 0.8, 0.6, 0.6); P.wings.push(w);
    const pts = [[0, 0, 0], [s * 2.2, 1.6, -0.4], [s * 4.6, 2.2, -1.0], [s * 5.6, 0.8, -1.6], [s * 4.8, -0.6, -2.6], [s * 3.4, -0.4, -3.2], [s * 2.0, -0.6, -3.4], [s * 0.4, -0.3, -2.4]];
    const pos = []; for (let i = 2; i < pts.length; i++) pos.push(...pts[0], ...pts[i - 1], ...pts[i]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    w.add(new THREE.Mesh(geo, memb));
    for (const i of [1, 2, 3, 4, 5]) {   // finger bones
      const a = new THREE.Vector3(...(i <= 2 ? pts[0] : pts[2])), b = new THREE.Vector3(...pts[i]);
      const m = new THREE.Mesh(G.cylLo, bone); m.position.copy(a).lerp(b, 0.5); m.scale.set(0.07, a.distanceTo(b), 0.07);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); w.add(m);
    }
    K(w, horn, s * 4.6, 2.5, -1.0, 0.07, 0.5, 0, 0, -s * 0.3);
  }
  return P;
}
