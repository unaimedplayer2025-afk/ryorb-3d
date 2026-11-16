import * as THREE from 'three';
export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
export const angLerp = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; };

export function std(color, o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...o }); }
export function glow(color, intensity = 2) { return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false }); }
export function additive(color, opacity = 0.5, o = {}) { return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, ...o }); }

// Neon rim light (fresnel emissive) for the 1985 crew; shares one shader program.
export function rimify(mat, rimColor, strength = 2.6, power = 2.0) {
  const rim = { value: new THREE.Color(rimColor).multiplyScalar(strength) }, pw = { value: power };
  mat.userData.rim = rim;
  mat.onBeforeCompile = sh => {
    sh.uniforms.rimColor = rim; sh.uniforms.rimPow = pw;
    sh.fragmentShader = 'uniform vec3 rimColor; uniform float rimPow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n float rimF = 1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);\n totalEmissiveRadiance += rimColor * pow(rimF, rimPow);');
  };
  mat.customProgramCacheKey = () => 'rim';
  return mat;
}

// Shorthand: add a mesh to a parent at a position.
export function part(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); parent.add(m); return m;
}
export function grp(parent, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; }

// ---- canvas textures ----
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}
export const Tex = {
  grid(rep) {
    return canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#07010f'; g.fillRect(0, 0, w, h);
      g.shadowBlur = 10; g.shadowColor = '#ff2ad4'; g.strokeStyle = '#ff3ae0'; g.lineWidth = 5; g.strokeRect(0, 0, w, h);
      g.shadowColor = '#2af0ff'; g.strokeStyle = 'rgba(60,220,255,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    }, rep);
  },
  ground2098(rep) {
    return canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#1a1816'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { const v = 10 + Math.random() * 40 | 0; g.fillStyle = `rgba(${v + 8},${v + 4},${v},0.6)`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 2 + Math.random() * 5); }
      for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
      for (let i = 0; i < 12; i++) { const x = Math.random() * w, y = Math.random() * h, r = 20 + Math.random() * 50; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,0.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    }, rep);
  },
  concrete() {
    return canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#6a6660'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4000; i++) { const v = 70 + Math.random() * 60 | 0; g.fillStyle = `rgba(${v},${v - 4},${v - 10},0.35)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      for (let i = 0; i < 14; i++) { g.strokeStyle = 'rgba(20,18,16,0.7)'; g.lineWidth = 1.5; g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 50; y += Math.random() * 40; g.lineTo(x, y); } g.stroke(); }
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,6,4,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
  },
  windows(lit, colors) {
    return canvasTex(128, 256, (g, w, h) => {
      g.fillStyle = '#0a0612'; g.fillRect(0, 0, w, h);
      for (let y = 8; y < h - 8; y += 16) for (let x = 6; x < w - 6; x += 14) {
        if (Math.random() < lit) { g.fillStyle = pick(colors); g.globalAlpha = 0.5 + Math.random() * 0.5; g.fillRect(x, y, 8, 9); }
        else { g.fillStyle = '#140c20'; g.globalAlpha = 1; g.fillRect(x, y, 8, 9); }
      }
      g.globalAlpha = 1;
    });
  },
  sign(text, color, bg = 'rgba(0,0,0,0)', font = 'bold italic 84px "Arial Black", Impact, sans-serif') {
    return canvasTex(512, 128, (g, w, h) => {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = color; g.shadowBlur = 24; g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 4);
      g.shadowBlur = 0; g.fillStyle = '#fff'; g.globalAlpha = 0.55; g.fillText(text, w / 2, h / 2 + 4);
    });
  },
  dot() {
    return canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  },
  smoke() {
    return canvasTex(128, 128, (g, w) => {
      for (let i = 0; i < 18; i++) { const x = 30 + Math.random() * 68, y = 30 + Math.random() * 68, r = 14 + Math.random() * 30; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }
    });
  },
  ring() {
    return canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 30, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  }
};
