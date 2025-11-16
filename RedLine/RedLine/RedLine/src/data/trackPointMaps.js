// src/data/trackPointMaps.js
// High-fidelity 2D centerline generators for sample circuits.
// Exports `trackPointMaps` where each key is the track id (monza, silverstone, spa).
// Each generator produces N sample points along a smooth centerline.
// Default sampleCount = 400 (medium density). Increase to 1000 for very smooth motion.
//
// These are *approximations* intended for visualization/demo purposes (not official geometry).
// If you want real GPS/GPX -> high-precision geometry, provide GPX files and I'll convert them.
//
// Usage:
// import { trackPointMaps } from "../data/trackPointMaps.js";
// const pts = trackPointMaps.monza(400); // returns array of {x,y}

function sampleCurve(fn, n = 400) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const p = fn(t);
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

/**
 * Smooth interpolation helpers (cubic Hermite-ish)
 * We'll produce smooth centerlines by blending arcs & bezier-like segments.
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function mix(p0, p1, t) {
  return { x: lerp(p0.x, p1.x, t), y: lerp(p0.y, p1.y, t) };
}
function catmullRom(p0, p1, p2, p3, t) {
  // standard Catmull-Rom to smooth between p1 and p2
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      ((2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      ((2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/* ---------------------------
   Monza (approximate layout)
   - Fast straights, a few sweepers and chicanes
   - We'll compose two long straights + chicanes and loop back
   --------------------------- */
function generateMonza(sampleCount = 400) {
  // Construct a few anchor points roughly representing Monza-like flow
  const anchors = [
    { x: 0, y: 0 },     // start of front straight
    { x: 320, y: -10 }, // kink into chicane
    { x: 480, y: 40 },  // chicane exit
    { x: 620, y: 140 }, // loop down to Lesmo
    { x: 560, y: 260 }, // Lesmo curve
    { x: 420, y: 320 }, // Variante Ascari area
    { x: 240, y: 300 }, // mild bend
    { x: 140, y: 200 }, // proceed to curva
    { x: 180, y: 80 },  // back toward start
    { x: 260, y: 20 },  // finish line region
  ];

  // make a closed set by duplicating start anchors at the end for catmull smoothing
  const closed = [...anchors, anchors[0], anchors[1], anchors[2]];

  // sample smoothly using Catmull-Rom across anchors
  const segments = closed.length - 3; // each segment between p1-p2
  const perSeg = Math.max(3, Math.floor(sampleCount / segments));
  const pts = [];
  for (let s = 0; s < segments; s++) {
    for (let i = 0; i < perSeg; i++) {
      const t = i / perSeg;
      const p = catmullRom(closed[s], closed[s + 1], closed[s + 2], closed[s + 3], t);
      pts.push(p);
    }
  }

  // ensure length exactly sampleCount by resampling linearly along index
  const out = [];
  for (let i = 0; i < sampleCount; i++) {
    const idx = (i / sampleCount) * pts.length;
    const i0 = Math.floor(idx) % pts.length;
    const i1 = (i0 + 1) % pts.length;
    const frac = idx - Math.floor(idx);
    out.push(mix(pts[i0], pts[i1], frac));
  }
  return out;
}

/* ---------------------------
   Silverstone (approximate layout)
   - Flowing complex of corners (Copse, Maggots, Becketts, Chapel)
   - We'll create a smoother, more twisting centerline
   --------------------------- */
function generateSilverstone(sampleCount = 400) {
  const anchors = [
    { x: 0, y: 0 },    // start
    { x: 140, y: -30 }, // Copse region
    { x: 260, y: -10 }, // curve
    { x: 360, y: 40 },  // Maggots entry
    { x: 420, y: 110 }, // Becketts complex
    { x: 360, y: 200 }, // Chapel
    { x: 240, y: 240 }, // Hangar straight area
    { x: 120, y: 220 }, // slow corner back
    { x: 40, y: 160 },  // loop
    { x: 20, y: 80 },   // return near start
  ];

  const closed = [...anchors, anchors[0], anchors[1], anchors[2]];
  const segments = closed.length - 3;
  const perSeg = Math.max(3, Math.floor(sampleCount / segments));
  const pts = [];
  for (let s = 0; s < segments; s++) {
    for (let i = 0; i < perSeg; i++) {
      const t = i / perSeg;
      // add a small sinusoidal perturbation to emulate rapid complex transitions
      const base = catmullRom(closed[s], closed[s + 1], closed[s + 2], closed[s + 3], t);
      const wobble = Math.sin((s + t) * 6) * 1.2;
      pts.push({ x: base.x + wobble * (s % 2 ? 1 : -1), y: base.y + Math.cos((s + t) * 4) * 0.8 });
    }
  }

  const out = [];
  for (let i = 0; i < sampleCount; i++) {
    const idx = (i / sampleCount) * pts.length;
    const i0 = Math.floor(idx) % pts.length;
    const i1 = (i0 + 1) % pts.length;
    const frac = idx - Math.floor(idx);
    out.push(mix(pts[i0], pts[i1], frac));
  }
  return out;
}

/* ---------------------------
   Spa-Francorchamps (approximate layout)
   - Big elevation changes in real life; here we simulate a long sweeping back straight,
     fast corners (Eau Rouge-ish), and a long flowing sector.
   - We'll create a stretched loop w/ dramatic bends.
   --------------------------- */
function generateSpa(sampleCount = 400) {
  const anchors = [
    { x: 0, y: 0 },     // start
    { x: 120, y: -40 }, // uphill/compression (Eau Rouge area)
    { x: 220, y: -20 }, // crest
    { x: 350, y: 40 },  // fast sweep
    { x: 420, y: 140 }, // long right-hander
    { x: 520, y: 240 }, // back straight
    { x: 640, y: 300 }, // slow complex
    { x: 520, y: 360 }, // loop back
    { x: 360, y: 340 }, // flowing sector
    { x: 200, y: 240 }, // final complex
  ];
  const closed = [...anchors, anchors[0], anchors[1], anchors[2]];
  const segments = closed.length - 3;
  const perSeg = Math.max(3, Math.floor(sampleCount / segments));
  const pts = [];
  for (let s = 0; s < segments; s++) {
    for (let i = 0; i < perSeg; i++) {
      const t = i / perSeg;
      // use catmull + small radial offset to add variety
      const base = catmullRom(closed[s], closed[s + 1], closed[s + 2], closed[s + 3], t);
      const r = Math.sin((s + t) * 3) * 1.6;
      pts.push({ x: base.x + r * Math.cos((s + t) * 2.3), y: base.y + r * Math.sin((s + t) * 2.3) });
    }
  }

  const out = [];
  for (let i = 0; i < sampleCount; i++) {
    const idx = (i / sampleCount) * pts.length;
    const i0 = Math.floor(idx) % pts.length;
    const i1 = (i0 + 1) % pts.length;
    const frac = idx - Math.floor(idx);
    out.push(mix(pts[i0], pts[i1], frac));
  }
  return out;
}

/* Exported map: functions (call with sampleCount) and a small helper to produce default arrays */
export const trackPointMaps = {
  // functions: call trackPointMaps.monza(400) to generate points
  monza: (n = 400) => generateMonza(n),
  silverstone: (n = 400) => generateSilverstone(n),
  spa: (n = 400) => generateSpa(n),

  // convenience: defaultPoints returns a map of pre-sampled arrays (useful for direct imports)
  defaultPoints: (n = 400) => ({
    monza: generateMonza(n),
    silverstone: generateSilverstone(n),
    spa: generateSpa(n),
  }),
};

export default trackPointMaps;
