// src/components/ThreeTrack.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createCarMesh } from "../three/Car3D.js";

/**
 * Props:
 *  - rawTrackPoints: [{x,y}, ...]  (normalized coords e.g. 0..800 / 0..600)
 *  - width, height: optional canvas size (defaults to container size)
 *  - padding: optional padding inside viewport (default 28)
 *  - carProgress: number 0..1
 *  - running: boolean
 *  - speedFactor: number multiplier for camera smoothing
 */
export default function ThreeTrack({
  rawTrackPoints = [],
  width,
  height,
  padding = 28,
  carProgress = 0,
  running = false,
  speedFactor = 1.0,
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    trackMesh: null,
    tubeCurve: null,
    tubeMesh: null,
    car: null,
    raf: null,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Basic renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0); // transparent background; parent styles apply
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    cam.position.set(0, -300, 220); // will be adjusted to fit
    cam.up.set(0, 0, 1);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(200, 200, 300);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 2000;
    scene.add(dir);

    // Ground plane (subtle)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0b0f12, metalness: 0.1, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -6;
    ground.receiveShadow = true;
    scene.add(ground);

    // Orbit controls
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.minDistance = 40;
    controls.maxDistance = 1200;
    controls.target.set(0, 0, 0);

    // store
    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = cam;
    stateRef.current.controls = controls;

    // resize handler
    function onResize() {
      const rect = container.getBoundingClientRect();
      const w = width || Math.max(300, Math.floor(rect.width));
      const h = height || Math.max(200, Math.floor(rect.height));
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize, { passive: true });
    onResize();

    // animate loop
    let lastTime = performance.now();
    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // update controls
      controls.update();

      // update car position if created
      const s = stateRef.current;
      if (s.tubeCurve && s.car) {
        // carProgress is passed in via props; no internal increment here
        const t = THREE.MathUtils.euclideanModulo(carProgress, 1.0);
        const p = s.tubeCurve.getPointAt(t);
        s.car.position.set(p.x, p.y, p.z + 4.5); // small lift above track
        // orient car along tangent
        const tangent = s.tubeCurve.getTangentAt(t);
        const lookAtTarget = new THREE.Vector3(p.x + tangent.x, p.y + tangent.y, p.z + tangent.z);
        s.car.lookAt(lookAtTarget);

        // subtle bobbing when running
        if (running) {
          s.car.position.z += Math.sin(now / 240) * 0.15;
        }
      }

      // camera follow (smooth)
      if (s.car) {
        const desired = new THREE.Vector3(s.car.position.x, s.car.position.y - 90 * (1 / Math.max(0.6, speedFactor)), s.car.position.z + 60);
        // lerp camera to desired
        s.camera.position.lerp(desired, 0.08 * Math.min(2, Math.max(0.2, speedFactor)));
        // look at car
        s.camera.lookAt(s.car.position);
        s.controls.target.lerp(s.car.position, 0.08);
      }

      renderer.render(scene, cam);
      s.raf = requestAnimationFrame(loop);
    };
    stateRef.current.raf = requestAnimationFrame(loop);

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      const s = stateRef.current;
      if (s.raf) cancelAnimationFrame(s.raf);
      controls.dispose();
      renderer.dispose();
      // remove canvas
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      // dispose scene children geometries & materials
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      stateRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build / update track + car whenever rawTrackPoints changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene) return;
    // remove previous track & car if any
    if (s.tubeMesh) {
      s.scene.remove(s.tubeMesh);
      s.tubeMesh.geometry.dispose();
      s.tubeMesh.material.dispose();
      s.tubeMesh = null;
      s.tubeCurve = null;
    }
    if (s.car) {
      s.scene.remove(s.car);
      // car mesh disposal is handled next (simple)
      s.car.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      s.car = null;
    }

    if (!rawTrackPoints || rawTrackPoints.length < 4) return;

    // Map 2D points to 3D positions. rawTrackPoints likely in range 0..800 / 0..600
    // We'll center them and flip Y to match Three.js coordinates where +Y goes up screen.
    const pts2d = rawTrackPoints;
    // compute bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts2d.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
    const w = maxX - minX || 800;
    const h = maxY - minY || 600;
    // scale to fit a comfortable world size (approx 600 units)
    const targetSize = 700;
    const scale = Math.min(targetSize / w, targetSize / h) * 0.9;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Build curve
    const points3 = pts2d.map((p) => {
      const x = (p.x - centerX) * scale;
      const y = (p.y - centerY) * scale;
      const z = 0;
      // flip y so 2D image top becomes +Y forward
      return new THREE.Vector3(x, -y, z);
    });

    // make CatmullRom curve and closed
    const curve = new THREE.CatmullRomCurve3(points3, true, "catmullrom", 0.5);
    s.tubeCurve = curve;

    // TubeGeometry (serves as track mesh center). radius controls perceived track width
    const tubularSegments = Math.max(200, points3.length * 2);
    const trackRadius = Math.max(6, Math.min(26, (scale * 2.4))); // dynamic width
    const tubeGeo = new THREE.TubeGeometry(curve, tubularSegments, trackRadius, 16, true);

    // Track material - asphalt look
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x22272b,
      metalness: 0.05,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });

    const tubeMesh = new THREE.Mesh(tubeGeo, trackMat);
    tubeMesh.receiveShadow = true;
    tubeMesh.castShadow = false;
    s.scene.add(tubeMesh);
    s.tubeMesh = tubeMesh;

    // centerline highlight (thin)
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1, transparent: true, opacity: 0.85 });
    const linePts = curve.getPoints(Math.max(200, points3.length));
    const lineGeom = new THREE.BufferGeometry().setFromPoints(linePts);
    const centerLine = new THREE.Line(lineGeom, lineMat);
    centerLine.position.z = 0.5;
    s.scene.add(centerLine);

    // car
    const car = createCarMesh();
    car.castShadow = true;
    car.receiveShadow = false;
    s.scene.add(car);
    s.car = car;

    // initial camera framing
    // compute bounding sphere
    const bb = new THREE.Box3().setFromObject(tubeMesh);
    const size = bb.getSize(new THREE.Vector3());
    const center = bb.getCenter(new THREE.Vector3());
    // place camera back relative to size
    s.camera.position.set(center.x, center.y - Math.max(size.x, size.y) * 0.9, Math.max(size.x, size.y) * 0.55 + 40);
    s.camera.lookAt(center);
    s.controls.target.copy(center);

    // done
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTrackPoints]);

  // Update camera on size changes (ensure renderer size matches container)
  useEffect(() => {
    const s = stateRef.current;
    if (!s.renderer || !containerRef.current) return;
    const resize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const w = width || Math.max(300, Math.floor(rect.width));
      const h = height || Math.max(200, Math.floor(rect.height));
      s.renderer.setSize(w, h);
      if (s.camera) {
        s.camera.aspect = w / h;
        s.camera.updateProjectionMatrix();
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [width, height]);

  return <div ref={containerRef} style={{ width: "100%", height: "420px", borderRadius: 12, overflow: "hidden" }} />;
}
