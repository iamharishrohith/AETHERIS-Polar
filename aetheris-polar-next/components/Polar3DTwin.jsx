"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Radio, Box } from "lucide-react";

function createSnowIceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  
  ctx.fillStyle = "#F1F5F9";
  ctx.fillRect(0, 0, 512, 512);
  
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(186, 230, 253, 0.4)" : "rgba(224, 242, 254, 0.6)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.strokeStyle = "rgba(203, 213, 225, 0.35)";
  ctx.lineWidth = 3;
  for (let j = 0; j < 25; j++) {
    ctx.beginPath();
    const startY = Math.random() * 512;
    ctx.moveTo(0, startY);
    ctx.bezierCurveTo(150, startY + 20, 350, startY - 20, 512, startY + 10);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createSolarCellTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#0284C7";
  ctx.lineWidth = 1;
  for (let x = 0; x <= 256; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

export default function Polar3DTwin({ telemetry, stationCode = "BHARATI" }) {
  const mountRef = useRef(null);
  const [cameraView, setCameraView] = useState("iso");
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0F9FF);
    scene.fog = new THREE.FogExp2(0xF0F9FF, 0.005);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(45, 30, 50);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 140;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xE0F2FE, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.3);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Textures
    const snowTex = createSnowIceTexture();
    const solarTex = createSolarCellTexture();

    // Terrain
    const terrainGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      pos.setZ(i, Math.sin(vx * 0.05) * Math.cos(vy * 0.05) * 1.5 + (vy < -30 ? 3 : 0));
    }
    terrainGeo.computeVertexNormals();
    const terrain = new THREE.Mesh(
      terrainGeo,
      new THREE.MeshStandardMaterial({ map: snowTex, roughness: 0.85, metalness: 0.15 })
    );
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Bharati Main Pod Structure
    const stationGroup = new THREE.Group();
    const hullOrangeMat = new THREE.MeshStandardMaterial({ color: 0xEA580C, roughness: 0.3, metalness: 0.4 });
    const hullWhiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.25, metalness: 0.3 });
    const steelStiltMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, transparent: true, opacity: 0.85 });

    const mainPod = new THREE.Mesh(new THREE.BoxGeometry(18, 6, 12), hullOrangeMat);
    mainPod.position.set(0, 7, 0);
    mainPod.castShadow = true;
    stationGroup.add(mainPod);

    const obsDeck = new THREE.Mesh(new THREE.BoxGeometry(18.2, 1.6, 12.2), glassMat);
    obsDeck.position.set(0, 8, 0);
    stationGroup.add(obsDeck);

    const northPod = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 8), hullWhiteMat);
    northPod.position.set(-12, 6.5, -1);
    northPod.castShadow = true;
    stationGroup.add(northPod);

    const southPod = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 8), hullWhiteMat);
    southPod.position.set(12, 6.5, -1);
    southPod.castShadow = true;
    stationGroup.add(southPod);

    // Stilts
    [-15, -9, 0, 9, 15].forEach((sx) => {
      [-4, 4].forEach((sz) => {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6.5, 16), steelStiltMat);
        stilt.position.set(sx, 3.25, sz);
        stilt.castShadow = true;
        stationGroup.add(stilt);
      });
    });

    scene.add(stationGroup);

    // Wind Turbines
    const turbineBlades = [];
    [ { x: -28, z: -18 }, { x: 28, z: -18 }, { x: 0, z: -30 } ].forEach((tp) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 22, 16), hullWhiteMat);
      tower.position.set(tp.x, 11, tp.z);
      tower.castShadow = true;
      scene.add(tower);

      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 3.5), hullOrangeMat);
      nacelle.position.set(tp.x, 22, tp.z);
      scene.add(nacelle);

      const bladeHub = new THREE.Group();
      bladeHub.position.set(tp.x, 22, tp.z + 1.8);
      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.z = (b * 2 * Math.PI) / 3;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.5, 0.08), hullWhiteMat);
        blade.position.set(0, 3.8, 0);
        bladeArm.add(blade);
        bladeHub.add(bladeArm);
      }
      scene.add(bladeHub);
      turbineBlades.push(bladeHub);
    });

    // Bifacial Solar
    for (let col = 0; col < 4; col++) {
      const pv = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.15, 3.5),
        new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.2, metalness: 0.8 })
      );
      pv.position.set(-15 + col * 10, 2, 16);
      pv.rotation.x = -Math.PI / 5;
      pv.castShadow = true;
      scene.add(pv);
    }

    // Dynamic Particle Stream
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const flowCurves = [
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-28, 22, -18), new THREE.Vector3(-15, 16, -5), new THREE.Vector3(0, 7, 0)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(28, 22, -18), new THREE.Vector3(15, 16, -5), new THREE.Vector3(0, 7, 0)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-10, 2, 16), new THREE.Vector3(-5, 6, 8), new THREE.Vector3(0, 7, 0))
    ];
    const particleMat = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const speed = Math.max(0.04, (telemetry?.wind_speed_ms || 18) * 0.004);
      turbineBlades.forEach((tb) => { tb.rotation.z -= speed; });

      for (let i = 0; i < particleCount; i++) {
        const curveIdx = i % flowCurves.length;
        const curve = flowCurves[curveIdx];
        const t = (elapsed * 0.35 + i / particleCount) % 1.0;
        const pt = curve.getPoint(t);
        particlePositions[i * 3] = pt.x;
        particlePositions[i * 3 + 1] = pt.y;
        particlePositions[i * 3 + 2] = pt.z;
        particleColors[i * 3] = curveIdx === 2 ? 0.96 : 0.01;
        particleColors[i * 3 + 1] = curveIdx === 2 ? 0.62 : 0.52;
        particleColors[i * 3 + 2] = curveIdx === 2 ? 0.04 : 0.78;
      }
      particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stationCode]);

  const setViewPreset = (view) => {
    setCameraView(view);
    if (!cameraRef.current || !controlsRef.current) return;
    if (view === "iso") {
      cameraRef.current.position.set(45, 30, 50);
      controlsRef.current.target.set(0, 5, 0);
    } else if (view === "close") {
      cameraRef.current.position.set(18, 12, 22);
      controlsRef.current.target.set(0, 7, 0);
    } else if (view === "turbines") {
      cameraRef.current.position.set(-35, 25, -2);
      controlsRef.current.target.set(-20, 18, -15);
    } else if (view === "top") {
      cameraRef.current.position.set(0, 80, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  return (
    <div className="three-canvas-container" ref={mountRef}>
      <div className="three-overlay-hud">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div className="pulse-dot"></div>
          <span style={{ fontWeight: 800, color: "var(--brand-cyan-dark)", letterSpacing: "0.04em" }}>
            POLAR DIGITAL TWIN // {stationCode}
          </span>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 11.5 }}>
          Lat: 69.407°S, 76.191°E | Next.js Serverless Telemetry Stream
        </div>
      </div>

      <div className="three-controls-bar">
        <div style={{ display: "flex", gap: 4, marginRight: 8, borderRight: "1px solid var(--border-color)", paddingRight: 8 }}>
          <button className={`btn-preset ${cameraView === "iso" ? "active" : ""}`} onClick={() => setViewPreset("iso")}>Iso 3D</button>
          <button className={`btn-preset ${cameraView === "close" ? "active" : ""}`} onClick={() => setViewPreset("close")}>Pods</button>
          <button className={`btn-preset ${cameraView === "turbines" ? "active" : ""}`} onClick={() => setViewPreset("turbines")}>Wind Array</button>
          <button className={`btn-preset ${cameraView === "top" ? "active" : ""}`} onClick={() => setViewPreset("top")}>Top Plan</button>
        </div>
        <span className="sec65b-pill" style={{ background: "#FFF", fontSize: 11 }}>
          <Radio size={12} style={{ color: "var(--accent-emerald)" }} /> WebGL PBR Orbit Active
        </span>
      </div>
    </div>
  );
}
