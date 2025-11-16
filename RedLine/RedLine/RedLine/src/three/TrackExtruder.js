// src/three/TrackExtruder.js
import * as THREE from "three";

/**
 * createExtrudedTrack(points3, options)
 * - points3: [THREE.Vector3,...] closed or open
 * - options: { width }
 * Returns: THREE.Mesh
 *
 * (This helper produces an extruded track mesh by sweeping a shape along the centerline.
 *  For the simple renderer we used TubeGeometry which is faster - keep this as future reference.)
 */
export function createExtrudedTrack(points3 = [], options = {}) {
  const width = options.width || 12;
  if (!points3 || points3.length < 3) return null;

  // build 2D shape (rectangle centered)
  const half = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-half, -1);
  shape.lineTo(half, -1);
  shape.lineTo(half, 1);
  shape.lineTo(-half, 1);
  shape.closePath();

  // build path for extrude
  const path = new THREE.CatmullRomCurve3(points3, true);
  const extrudeSettings = { steps: Math.max(100, points3.length), bevelEnabled: false, extrudePath: path };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1b1f23, roughness: 0.85 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}
