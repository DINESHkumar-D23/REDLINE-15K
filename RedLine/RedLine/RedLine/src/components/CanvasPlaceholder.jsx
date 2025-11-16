// src/components/CanvasPlaceholder.jsx
import React, { useMemo, useRef, useEffect } from "react";

/**
 * CanvasPlaceholder
 * Renders a simple 2D SVG track from rawTrackPoints and a moving marker.
 *
 * Props:
 * - rawTrackPoints: [{x,y}] in arbitrary coordinates (centerline)
 * - width: viewport width (default 800)
 * - height: viewport height (default 420)
 * - padding: integer padding inside viewport (default 28)
 * - running: boolean, whether simulation is running (affects marker glow)
 * - carProgress: number 0..1
 * - speedFactor: optional multiplier (not used here except for potential visual scaling)
 * - onLap: optional callback called when a lap is detected: onLap({ lapTimeSeconds, progress })
 */
export default function CanvasPlaceholder({
  rawTrackPoints = [],
  width = 800,
  height = 420,
  padding = 28,
  running = false,
  carProgress = 0,
  speedFactor = 1,
  onLap = null,
}) {
  // Normalize points to viewport (same algorithm as utils/trackUtils.normalizeTrack)
  const normalized = useMemo(() => {
    if (!rawTrackPoints || rawTrackPoints.length === 0) return [];

    const xs = rawTrackPoints.map((p) => p.x);
    const ys = rawTrackPoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const dataW = Math.max(1, maxX - minX);
    const dataH = Math.max(1, maxY - minY);

    const targetW = Math.max(1, width - 2 * padding);
    const targetH = Math.max(1, height - 2 * padding);
    const scale = Math.min(targetW / dataW, targetH / dataH);

    const offsetX = padding + (targetW - dataW * scale) / 2;
    const offsetY = padding + (targetH - dataH * scale) / 2;

    return rawTrackPoints.map((p) => ({
      x: (p.x - minX) * scale + offsetX,
      y: (p.y - minY) * scale + offsetY,
    }));
  }, [rawTrackPoints, width, height, padding]);

  // Precompute segment lengths and total length
  const segInfo = useMemo(() => {
    if (!normalized || normalized.length < 2) return { segs: [], total: 0 };
    const segs = [];
    let total = 0;
    for (let i = 0; i < normalized.length - 1; i++) {
      const a = normalized[i];
      const b = normalized[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 0.00001;
      segs.push({ a, b, len });
      total += len;
    }
    return { segs, total };
  }, [normalized]);

  // compute the marker position for given progress in [0..1]
  const marker = useMemo(() => {
    const { segs, total } = segInfo;
    if (!segs || segs.length === 0 || !isFinite(total) || total <= 0) {
      if (normalized && normalized.length > 0) return { x: normalized[0].x, y: normalized[0].y, angle: 0 };
      return { x: width / 2, y: height / 2, angle: 0 };
    }
    // wrap progress into [0,1)
    let t = ((carProgress % 1) + 1) % 1;
    const targetDist = t * total;
    let acc = 0;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (acc + s.len >= targetDist) {
        const local = (targetDist - acc) / s.len;
        const x = s.a.x + (s.b.x - s.a.x) * local;
        const y = s.a.y + (s.b.y - s.a.y) * local;
        const angle = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x);
        return { x, y, angle, segmentIndex: i, local };
      }
      acc += s.len;
    }
    const last = segs[segs.length - 1];
    const angle = Math.atan2(last.b.y - last.a.y, last.b.x - last.a.x);
    return { x: last.b.x, y: last.b.y, angle, segmentIndex: segs.length - 1, local: 1 };
  }, [segInfo, carProgress, normalized, width, height]);

  // Lap detection: call onLap when progress wraps from near-end to near-start
  const prevProgressRef = useRef(carProgress);
  const lapTimestampRef = useRef(null);
  useEffect(() => {
    const prev = prevProgressRef.current;
    const cur = carProgress;
    // detect wrap-around: prev > 0.9 and cur < 0.1
    if (prev > 0.9 && cur < 0.1) {
      const now = performance.now();
      let lapTimeSeconds = null;
      if (lapTimestampRef.current) {
        lapTimeSeconds = (now - lapTimestampRef.current) / 1000;
      }
      lapTimestampRef.current = now;
      if (typeof onLap === "function") {
        try {
          onLap({ lapTimeSeconds, progress: cur });
        } catch (e) {
          // ignore callback errors
        }
      }
    }
    prevProgressRef.current = cur;
  }, [carProgress, onLap]);

  // small helpers for creating polyline string
  const polyPoints = useMemo(() => {
    if (!normalized || normalized.length === 0) return "";
    return normalized.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }, [normalized]);

  // trail circle animation values
  const trailRadius = running ? 18 * Math.min(1.6, Math.max(0.6, speedFactor)) : 0;
  const markerRadius = running ? 6 : 5;

  return (
    <div style={{ width: "100%", maxWidth: width, boxSizing: "border-box" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Track simulation preview"
      >
        {/* background subtle */}
        <defs>
          <linearGradient id="trackBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.02)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* subtle background rectangle */}
        <rect x="0" y="0" width={width} height={height} rx="8" ry="8" fill="transparent" />

        {/* outer soft stroke (wider, low opacity) to suggest track band */}
        {polyPoints && (
          <polyline
            points={polyPoints}
            fill="none"
            stroke="rgba(0,0,0,0.45)"
            strokeWidth={18}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.65}
          />
        )}

        {/* center line */}
        {polyPoints && (
          <polyline
            points={polyPoints}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* optional dashed reference lane */}
        {polyPoints && (
          <polyline
            points={polyPoints}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={1}
            strokeDasharray="6 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* moving marker trail (glow) */}
        {trailRadius > 0 && (
          <circle
            cx={marker.x}
            cy={marker.y}
            r={trailRadius}
            fill="none"
            stroke="rgba(255,65,108,0.14)"
            strokeWidth={2}
            opacity={0.9}
            style={{ filter: "url(#glow)" }}
          />
        )}

        {/* moving marker (foreground) */}
        <g transform={`translate(${marker.x}, ${marker.y}) rotate(${(marker.angle * 180) / Math.PI})`}>
          <circle cx={0} cy={0} r={markerRadius} fill="#ff416c" stroke="#ffffff" strokeWidth={1.2} />
          {/* small nose to show direction */}
          <rect x={markerRadius} y={-markerRadius / 3} width={markerRadius * 1.6} height={(markerRadius * 2) / 3} rx="1" ry="1" fill="#ff6b82" opacity={0.95} />
        </g>
      </svg>
    </div>
  );
}
