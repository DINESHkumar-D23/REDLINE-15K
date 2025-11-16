// src/three/Car3D.js
import * as THREE from "three";

/**
 * createCarMesh()
 * Returns a THREE.Group representing a small stylized car.
 */
export function createCarMesh() {
  const g = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(14, 8, 4);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff416c, metalness: 0.2, roughness: 0.35 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = false;
  body.position.z = 4;
  g.add(body);

  const cabinGeo = new THREE.BoxGeometry(8, 6, 2.5);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.05, roughness: 0.2, opacity: 0.95, transparent: true });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(1, 0, 6);
  cabin.castShadow = true;
  g.add(cabin);

  // wheels (simple)
  const wheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.6, 12);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0.0, roughness: 0.9 });
  const positions = [
    [-4, -3, 2.2],
    [4, -3, 2.2],
    [-4, 3, 2.2],
    [4, 3, 2.2],
  ];
  positions.forEach((pos) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(pos[0], pos[1], pos[2]);
    w.castShadow = true;
    g.add(w);
  });

  // subtle shadow-catcher (empty)
  g.scale.set(1.0, 1.0, 1.0);
  // ensure center is at wheel plane
  g.position.set(0, 0, 0);

  return g;
}
