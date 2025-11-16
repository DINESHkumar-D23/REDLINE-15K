// src/utils/trackUtils.js
// Utilities to normalize raw track points into an 800x600 viewport
// and compute a position on the track given a progress value [0..1].

/**
 * normalizeTrack(points, width, height, padding)
 * - points: [{x,y}] in arbitrary coords (or lat/lon mapped to x/y)
 * - width, height: output viewport size
 * - padding: inner margin
 *
 * returns array of points scaled/transformed to fit viewport
 */
export function normalizeTrack(points = [], width = 800, height = 600, padding = 20) {
  if (!points || points.length === 0) return [];

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const dataW = Math.max(1, maxX - minX);
  const dataH = Math.max(1, maxY - minY);

  // find scale to fit inside width - 2*padding and height - 2*padding, preserving aspect
  const targetW = Math.max(1, width - 2 * padding);
  const targetH = Math.max(1, height - 2 * padding);
  const scale = Math.min(targetW / dataW, targetH / dataH);

  // center offset
  const offsetX = padding + (targetW - dataW * scale) / 2;
  const offsetY = padding + (targetH - dataH * scale) / 2;

  // normalize points
  return points.map((p) => ({
    x: Math.round((p.x - minX) * scale + offsetX),
    y: Math.round((p.y - minY) * scale + offsetY),
  }));
}

/**
 * getPositionOnTrack(polylinePoints, t)
 * - polylinePoints: normalized [{x,y}, ...]
 * - t: progress 0..1 (wraps around)
 * returns { x, y, segmentIndex, localT }
 */
export function getPositionOnTrack(polylinePoints = [], t = 0) {
  if (!polylinePoints || polylinePoints.length === 0) return { x: 0, y: 0 };

  // normalize t into 0..1
  let tt = ((t % 1) + 1) % 1;

  // compute lengths between consecutive points
  const segs = [];
  let total = 0;
  for (let i = 0; i < polylinePoints.length - 1; i++) {
    const a = polylinePoints[i];
    const b = polylinePoints[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 0.00001;
    segs.push({ a, b, len });
    total += len;
  }

  if (total === 0) {
    // degenerate fallback to first point
    const p = polylinePoints[0];
    return { x: p.x, y: p.y, segmentIndex: 0, localT: 0 };
  }

  // target distance along polyline
  const targetDist = tt * total;
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (acc + seg.len >= targetDist) {
      const local = (targetDist - acc) / seg.len;
      const x = seg.a.x + (seg.b.x - seg.a.x) * local;
      const y = seg.a.y + (seg.b.y - seg.a.y) * local;
      return { x, y, segmentIndex: i, localT: local };
    }
    acc += seg.len;
  }

  // if targetDist is exactly on the end
  const last = polylinePoints[polylinePoints.length - 1];
  return { x: last.x, y: last.y, segmentIndex: polylinePoints.length - 2, localT: 1 };
}
