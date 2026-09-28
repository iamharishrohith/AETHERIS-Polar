"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Activity,
  Zap,
  Flame,
  ThermometerSnowflake,
  Wind,
  Sun,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Sliders,
  Radio,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronRight,
  RefreshCw,
  Box,
  CornerDownRight,
  Database,
  Lock,
  Compass,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Eye,
  Maximize2,
  MapPin,
  TrendingUp,
  Settings,
  Server
} from "lucide-react";


// Procedural Texture Helpers
function createSnowIceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  
  // Base snow white
  ctx.fillStyle = "#F1F5F9";
  ctx.fillRect(0, 0, 512, 512);
  
  // Blue ice glint noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(186, 230, 253, 0.4)" : "rgba(224, 242, 254, 0.6)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Wind-carved sastrugi snowdrift ridges
  ctx.strokeStyle = "rgba(203, 213, 225, 0.35)";
  ctx.lineWidth = 3;
  for (let j = 0; j < 30; j++) {
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
  
  // Silicon blue grid
  ctx.strokeStyle = "#0284C7";
  ctx.lineWidth = 1;
  const grid = 32;
  for (let x = 0; x <= 256; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  
  // Silver busbars
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 0); ctx.lineTo(64, 256);
  ctx.moveTo(192, 0); ctx.lineTo(192, 256);
  ctx.stroke();
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

function createHelipadTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(0, 0, 256, 256);
  
  // Yellow circle
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 90, 0, Math.PI * 2);
  ctx.stroke();
  
  // Yellow H
  ctx.fillStyle = "#F59E0B";
  ctx.font = "bold 90px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("H", 128, 130);
  
  return new THREE.CanvasTexture(canvas);
}

// Master Detailed 3D Digital Twin Component
function PolarStation3DView({ telemetry, stationCode }) {
  const mountRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState("all");
  const [selectedModule, setSelectedModule] = useState(null);
  const [cameraView, setCameraView] = useState("iso");
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 520;

    // Scene setup
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 140;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // Lighting (Polar Daylight + Warm Base Accent)
    const ambientLight = new THREE.AmbientLight(0xE0F2FE, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.3);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Subtle blue fill light from snow reflection
    const snowReflection = new THREE.DirectionalLight(0x38BDF8, 0.4);
    snowReflection.position.set(-20, -10, -20);
    scene.add(snowReflection);

    // Textures
    const snowTex = createSnowIceTexture();
    const solarTex = createSolarCellTexture();
    const helipadTex = createHelipadTexture();

    // 1. Procedural Snow & Nunatak Terrain Mesh
    const terrainGeo = new THREE.PlaneGeometry(160, 160, 64, 64);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      // Undulating snow mounds + rocky ridge on North
      let h = Math.sin(vx * 0.05) * Math.cos(vy * 0.05) * 1.5;
      if (vy < -30) {
        h += Math.sin((vx + vy) * 0.1) * 3.5; // Nunatak outcrop
      }
      pos.setZ(i, h);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: snowTex,
      roughness: 0.85,
      metalness: 0.15,
      color: 0xFFFFFF
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Nunatak Dark Granite Rocks
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      metalness: 0.2
    });
    [-35, -45, -25].forEach((rx, idx) => {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(4 + idx * 2, 1),
        rockMat
      );
      rock.position.set(rx, 2 + idx, -40 + idx * 5);
      rock.scale.set(1.5, 0.8, 1.2);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    });

    // 2. Main Bharati Aerodynamic Station Complex
    const stationGroup = new THREE.Group();
    
    // Materials
    const hullOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xEA580C, // High-visibility Antarctic Polar Orange
      roughness: 0.3,
      metalness: 0.4
    });
    const hullWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.25,
      metalness: 0.3
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0284C7,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const steelStiltMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.25
    });

    // Main Central Habitat Pod (2 stories, aerodynamic beveled shape)
    const mainPod = new THREE.Mesh(new THREE.BoxGeometry(18, 6, 12), hullOrangeMat);
    mainPod.position.set(0, 7, 0);
    mainPod.castShadow = true;
    mainPod.receiveShadow = true;
    stationGroup.add(mainPod);

    // Observation Panoramic Deck Glass Ribbon
    const obsDeck = new THREE.Mesh(new THREE.BoxGeometry(18.2, 1.6, 12.2), glassMat);
    obsDeck.position.set(0, 8, 0);
    stationGroup.add(obsDeck);

    // North Lab Wing Pod
    const northPod = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 8), hullWhiteMat);
    northPod.position.set(-12, 6.5, -1);
    northPod.castShadow = true;
    northPod.receiveShadow = true;
    stationGroup.add(northPod);

    // South Energy & Microgrid Control Pod
    const southPod = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 8), hullWhiteMat);
    southPod.position.set(12, 6.5, -1);
    southPod.castShadow = true;
    southPod.receiveShadow = true;
    stationGroup.add(southPod);

    // Aerodynamic Inter-Module Gangways
    [-6.5, 6.5].forEach((gx) => {
      const gangway = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), steelStiltMat);
      gangway.position.set(gx, 6.5, 0);
      gangway.castShadow = true;
      stationGroup.add(gangway);
    });

    // Hydraulic Heavy Stilts with Cross-Braces
    [-15, -9, 0, 9, 15].forEach((sx) => {
      [-4, 4].forEach((sz) => {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6.5, 16), steelStiltMat);
        stilt.position.set(sx, 3.25, sz);
        stilt.castShadow = true;
        stationGroup.add(stilt);

        // Footing pad
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.4, 16), steelStiltMat);
        foot.position.set(sx, 0.2, sz);
        stationGroup.add(foot);
      });
    });

    // Rooftop Helipad
    const helipad = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 4.5, 0.3, 32),
      new THREE.MeshStandardMaterial({ map: helipadTex, roughness: 0.6 })
    );
    helipad.position.set(0, 10.2, 0);
    helipad.castShadow = true;
    stationGroup.add(helipad);

    // Geodesic Satellite Radome (White Dome)
    const radome = new THREE.Mesh(
      new THREE.SphereGeometry(2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 })
    );
    radome.position.set(-12, 9, -1);
    radome.castShadow = true;
    stationGroup.add(radome);

    // Meteorological LIDAR Mast & Wind Sensor
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), steelStiltMat);
    mast.position.set(12, 11, -1);
    stationGroup.add(mast);

    scene.add(stationGroup);

    // 3. Cold-Climate Wind Turbine Array
    const turbineBlades = [];
    const turbinePositions = [
      { x: -28, z: -18, h: 22 },
      { x: 28, z: -18, h: 22 },
      { x: 0, z: -32, h: 26 }
    ];

    turbinePositions.forEach((tp) => {
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.8, tp.h, 24),
        hullWhiteMat
      );
      tower.position.set(tp.x, tp.h / 2, tp.z);
      tower.castShadow = true;
      scene.add(tower);

      // Nacelle
      const nacelle = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.4, 3.5),
        new THREE.MeshStandardMaterial({ color: 0xEA580C, roughness: 0.3 })
      );
      nacelle.position.set(tp.x, tp.h, tp.z);
      nacelle.castShadow = true;
      scene.add(nacelle);

      // Warning Red Beacon Light
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xEF4444 })
      );
      beacon.position.set(tp.x, tp.h + 0.9, tp.z);
      scene.add(beacon);

      // Rotor Hub & 3 Curved Blades
      const bladeHub = new THREE.Group();
      bladeHub.position.set(tp.x, tp.h, tp.z + 1.8);

      const noseCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 1.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x0F172A })
      );
      noseCone.rotation.x = Math.PI / 2;
      bladeHub.add(noseCone);

      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.z = (b * 2 * Math.PI) / 3;

        const bladeGeom = new THREE.BoxGeometry(0.35, 7.5, 0.08);
        const blade = new THREE.Mesh(
          bladeGeom,
          new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 })
        );
        blade.position.set(0, 3.8, 0);
        blade.castShadow = true;
        bladeArm.add(blade);
        bladeHub.add(bladeArm);
      }

      scene.add(bladeHub);
      turbineBlades.push(bladeHub);
    });

    // 4. Bifacial Solar Photovoltaic Farm
    const solarFarmGroup = new THREE.Group();
    const pvPanelMat = new THREE.MeshStandardMaterial({
      map: solarTex,
      roughness: 0.15,
      metalness: 0.85
    });

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const pvTable = new THREE.Group();
        pvTable.position.set(-15 + col * 10, 0, 16 + row * 9);

        // Steel frame legs
        const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2), steelStiltMat);
        leg1.position.set(-2, 1, -1);
        const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3), steelStiltMat);
        leg2.position.set(-2, 1.5, 1);
        const leg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2), steelStiltMat);
        leg3.position.set(2, 1, -1);
        const leg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3), steelStiltMat);
        leg4.position.set(2, 1.5, 1);
        pvTable.add(leg1, leg2, leg3, leg4);

        // Panel Surface (tilted 35 deg for polar sun angle)
        const panel = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 3.5), pvPanelMat);
        panel.position.set(0, 2.2, 0);
        panel.rotation.x = -Math.PI / 5;
        panel.castShadow = true;
        pvTable.add(panel);

        solarFarmGroup.add(pvTable);
      }
    }
    scene.add(solarFarmGroup);

    // 5. Cryo LTO Battery & Fuel Cell Storage Containers
    const containerMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // Cryo Emerald
      roughness: 0.35,
      metalness: 0.5
    });
    [-16, 16].forEach((cx, idx) => {
      const container = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 8), idx === 0 ? containerMat : hullWhiteMat);
      container.position.set(cx, 1.5, 8);
      container.castShadow = true;
      container.receiveShadow = true;
      scene.add(container);
    });

    // 6. Dynamic 3D Bezier Energy Flow Particles (React Bits / Web3 Animated Glow Stream)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    // Define flow paths from generation sources to Station & Battery
    const flowCurves = [
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-28, 22, -18), new THREE.Vector3(-15, 16, -5), new THREE.Vector3(0, 7, 0)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(28, 22, -18), new THREE.Vector3(15, 16, -5), new THREE.Vector3(0, 7, 0)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 26, -32), new THREE.Vector3(0, 18, -15), new THREE.Vector3(0, 7, 0)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-10, 2, 16), new THREE.Vector3(-5, 6, 8), new THREE.Vector3(0, 7, 0)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(10, 2, 16), new THREE.Vector3(5, 6, 8), new THREE.Vector3(0, 7, 0))
    ];

    const particleMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate turbine blades based on telemetry wind speed
      const rotSpeed = Math.max(0.04, (telemetry?.wind_speed_ms || 18) * 0.004);
      turbineBlades.forEach((tb) => {
        tb.rotation.z -= rotSpeed;
      });

      // Update particle stream positions
      for (let i = 0; i < particleCount; i++) {
        const curveIndex = i % flowCurves.length;
        const curve = flowCurves[curveIndex];
        const t = (elapsedTime * 0.35 + i / particleCount) % 1.0;
        const pt = curve.getPoint(t);

        particlePositions[i * 3] = pt.x;
        particlePositions[i * 3 + 1] = pt.y;
        particlePositions[i * 3 + 2] = pt.z;

        // Color gradient: Cyan for wind, Amber for solar
        if (curveIndex < 3) {
          particleColors[i * 3] = 0.01;     // R
          particleColors[i * 3 + 1] = 0.52; // G
          particleColors[i * 3 + 2] = 0.78; // B (Cyan)
        } else {
          particleColors[i * 3] = 0.96;     // R
          particleColors[i * 3 + 1] = 0.62; // G
          particleColors[i * 3 + 2] = 0.04; // B (Amber)
        }
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
    <div className="three-canvas-container" style={{ height: 540 }} ref={mountRef}>
      {/* HUD HEADER OVERLAY */}
      <div className="three-overlay-hud">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div className="pulse-dot" style={{ background: "var(--brand-cyan)" }}></div>
          <span style={{ fontWeight: 800, color: "var(--brand-cyan-dark)", letterSpacing: "0.04em" }}>
            POLAR TWIN // {stationCode} COMPLEX
          </span>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 11.5 }}>
          Lat: 69.407°S, 76.191°E | Snow Pack: 160m² Mesh | Sub-20ms Telemetry Stream
        </div>
      </div>

      {/* CAMERA & LAYER CONTROLS BAR */}
      <div className="three-controls-bar">
        <div style={{ display: "flex", gap: 4, marginRight: 8, borderRight: "1px solid var(--border-color)", paddingRight: 8 }}>
          <button
            className={`btn-preset ${cameraView === "iso" ? "active" : ""}`}
            onClick={() => setViewPreset("iso")}
            title="Isometric Overview"
          >
            Iso 3D
          </button>
          <button
            className={`btn-preset ${cameraView === "close" ? "active" : ""}`}
            onClick={() => setViewPreset("close")}
            title="Station Close-up"
          >
            Habitat Pods
          </button>
          <button
            className={`btn-preset ${cameraView === "turbines" ? "active" : ""}`}
            onClick={() => setViewPreset("turbines")}
            title="Wind Turbine Park"
          >
            Wind Array
          </button>
          <button
            className={`btn-preset ${cameraView === "top" ? "active" : ""}`}
            onClick={() => setViewPreset("top")}
            title="Top-Down Plan"
          >
            Top Plan
          </button>
        </div>

        <span className="sec65b-pill" style={{ background: "#FFF", border: "1px solid var(--border-color)", fontSize: 11 }}>
          <Radio size={12} style={{ color: "var(--accent-emerald)" }} /> Drag to Orbit | Scroll to Zoom
        </span>
      </div>
    </div>
  );
}

export default function MasterCockpitPage() {
  const [stationCode, setStationCode] = useState("BHARATI");
  const [activeTab, setActiveTab] = useState("cockpit");
  const [telemetry, setTelemetry] = useState({
    timestamp: new Date().toISOString(),
    station: "Bharati Station (Larsemann Hills, Antarctica)",
    fsm_state: "COGEN_BALANCED",
    fsm_state_code: 1,
    fsm_description: "Optimal 75-85% DG load with hydronic heat balance.",
    ambient_temp_c: -28.4,
    wind_speed_ms: 18.2,
    air_density_kgm3: 1.482,
    solar_irradiance_wm2: 240,
    solar_pv_kw: 18.5,
    wind_kw: 32.4,
    diesel_dg1_kw: 38.2,
    diesel_dg2_kw: 0.0,
    lto_battery_kw: 12.0,
    lto_soc_pct: 86.4,
    total_generation_kw: 89.1,
    total_load_kw: 88.5,
    thermal_exhaust_kw: 42.1,
    thermal_jacket_kw: 31.4,
    thermal_recovered_kw: 73.5,
    thermal_demand_kw: 68.0,
    hydronic_supply_temp_c: 84.2,
    hydronic_return_temp_c: 63.8,
    katabatic_alert: false,
    katabatic_prob: 0.12,
    dp_dt_hpa_per_min: -0.08,
    dp_dt_30min: -1.2,
    shed_tier_1_kw: 0.0,
    shed_tier_2_kw: 0.0,
    co2_saved_kg_day: 892.4,
    fuel_reduction_pct: 42.8
  });

  // MILP Sandbox Interactive Parameters
  const [simTemp, setSimTemp] = useState(-28);
  const [simWind, setSimWind] = useState(18);
  const [simSolar, setSimSolar] = useState(240);

  // WebSocket live telemetry
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket("ws://localhost:8000/ws/telemetry");
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTelemetry((prev) => ({ ...prev, ...data }));
        } catch (e) {
          console.error("WS parse error", e);
        }
      };
    } catch (err) {
      console.warn("WebSocket fallback active");
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Dynamic Simplex Calculation for Sandbox
  const simRenewable = ((simSolar * 0.08) + Math.pow(Math.min(simWind, 25), 2.2) * 0.04).toFixed(1);
  const simLoad = (70 + (Math.abs(simTemp) * 0.6)).toFixed(1);
  const simDiesel = Math.max(0, (simLoad - simRenewable)).toFixed(1);
  const simFuelSaved = (100 - (simDiesel / simLoad) * 100).toFixed(1);

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon-wrapper">
              <Zap size={18} />
            </div>
            <span>AETHERIS-POLAR</span>
          </div>
          <div className="brand-tag">MoES // NCPOR PS-26061</div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-title">Control & Telemetry</div>
          
          <button
            className={`nav-item ${activeTab === "cockpit" ? "active" : ""}`}
            onClick={() => setActiveTab("cockpit")}
          >
            <Activity size={16} />
            <span>Operations Cockpit</span>
            <span className="nav-item-badge">LIVE</span>
          </button>

          <button
            className={`nav-item ${activeTab === "digital_twin_3d" ? "active" : ""}`}
            onClick={() => setActiveTab("digital_twin_3d")}
          >
            <Box size={16} />
            <span>3D Digital Twin</span>
            <span className="nav-item-badge" style={{ background: "var(--brand-cyan-light)", color: "var(--brand-cyan-dark)" }}>Three.js</span>
          </button>

          <button
            className={`nav-item ${activeTab === "milp_sandbox" ? "active" : ""}`}
            onClick={() => setActiveTab("milp_sandbox")}
          >
            <Sliders size={16} />
            <span>MILP Solver Sandbox</span>
          </button>

          <div className="nav-section-title">Physics & Safety</div>

          <button
            className={`nav-item ${activeTab === "katabatic" ? "active" : ""}`}
            onClick={() => setActiveTab("katabatic")}
          >
            <Wind size={16} />
            <span>Katabatic Shock AI</span>
            {telemetry.katabatic_alert && <span className="nav-item-badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>ALERT</span>}
          </button>

          <button
            className={`nav-item ${activeTab === "exergy" ? "active" : ""}`}
            onClick={() => setActiveTab("exergy")}
          >
            <Flame size={16} />
            <span>Dual-Vector Exergy</span>
          </button>

          <button
            className={`nav-item ${activeTab === "battery_lto" ? "active" : ""}`}
            onClick={() => setActiveTab("battery_lto")}
          >
            <ThermometerSnowflake size={16} />
            <span>Cryo LTO Storage</span>
          </button>

          <div className="nav-section-title">Hardware & Edge</div>

          <button
            className={`nav-item ${activeTab === "hil_oscilloscope" ? "active" : ""}`}
            onClick={() => setActiveTab("hil_oscilloscope")}
          >
            <Cpu size={16} />
            <span>HIL & Oscilloscope</span>
            <span className="nav-item-badge">&lt;20ms</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="system-node-card">
            <div className="node-status-row">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="pulse-dot"></span> Edge Node Active
              </span>
              <span style={{ color: "var(--accent-emerald)" }}>100% OK</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              ESP32-S3 Dual-Core | Modbus RTU Slave #1
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-wrapper">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <select
              className="station-select"
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value)}
            >
              <option value="BHARATI">Bharati Station (Antarctica, 69.407°S)</option>
              <option value="HIMADRI">Himadri Station (Arctic, 78.924°N)</option>
              <option value="MAITRI">Maitri Station (Antarctica, 70.766°S)</option>
            </select>

            <div className={`fsm-state-badge ${telemetry.katabatic_alert ? "alarm" : ""}`}>
              <Activity size={14} />
              <span>FSM: {telemetry.fsm_state}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="sec65b-pill">
              <CheckCircle2 size={13} style={{ color: "var(--accent-emerald)" }} />
              <span>Sub-20ms Deterministic SLA: ACTIVE</span>
            </div>
          </div>
        </header>

        {/* CONTENT CONTAINER */}
        <div className="content-container">
          {/* KPI STRIP */}
          <section className="kpi-strip">
            <div className="kpi-card" style={{ borderLeft: "4px solid var(--brand-cyan)" }}>
              <div className="kpi-header">
                <span className="kpi-title">Renewable Infeed</span>
                <div className="kpi-icon-badge" style={{ background: "var(--brand-cyan-light)", color: "var(--brand-cyan-dark)" }}>
                  <Zap size={16} />
                </div>
              </div>
              <div className="kpi-value">{(telemetry.solar_pv_kw + telemetry.wind_kw).toFixed(1)} <span style={{ fontSize: 14 }}>kW</span></div>
              <div className="kpi-subtext">
                <Sun size={12} style={{ color: "var(--accent-amber)" }} /> PV: {telemetry.solar_pv_kw} kW | <Wind size={12} style={{ color: "var(--brand-cyan)" }} /> Wind: {telemetry.wind_kw} kW
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: "4px solid var(--accent-amber)" }}>
              <div className="kpi-header">
                <span className="kpi-title">Diesel DG Baseline</span>
                <div className="kpi-icon-badge" style={{ background: "var(--accent-amber-light)", color: "var(--accent-amber)" }}>
                  <Gauge size={16} />
                </div>
              </div>
              <div className="kpi-value">{telemetry.diesel_dg1_kw.toFixed(1)} <span style={{ fontSize: 14 }}>kW</span></div>
              <div className="kpi-subtext">
                <Flame size={12} /> DG1: 78.4% Load Factor (Optimal)
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: "4px solid #DC2626" }}>
              <div className="kpi-header">
                <span className="kpi-title">Hydronic Heat Recovered</span>
                <div className="kpi-icon-badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  <Flame size={16} />
                </div>
              </div>
              <div className="kpi-value">{telemetry.thermal_recovered_kw.toFixed(1)} <span style={{ fontSize: 14 }}>kWth</span></div>
              <div className="kpi-subtext">
                <span>Supply: {telemetry.hydronic_supply_temp_c}°C | Return: {telemetry.hydronic_return_temp_c}°C</span>
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: "4px solid var(--accent-emerald)" }}>
              <div className="kpi-header">
                <span className="kpi-title">Cryo LTO Battery</span>
                <div className="kpi-icon-badge" style={{ background: "var(--accent-emerald-light)", color: "var(--accent-emerald)" }}>
                  <ThermometerSnowflake size={16} />
                </div>
              </div>
              <div className="kpi-value">{telemetry.lto_soc_pct.toFixed(1)} <span style={{ fontSize: 14 }}>%</span></div>
              <div className="kpi-subtext">
                <span>Flow: {telemetry.lto_battery_kw >= 0 ? `+${telemetry.lto_battery_kw} kW (Chg)` : `${telemetry.lto_battery_kw} kW (Dis)`}</span>
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: "4px solid var(--accent-indigo)" }}>
              <div className="kpi-header">
                <span className="kpi-title">Fuel Cut / Decarb</span>
                <div className="kpi-icon-badge" style={{ background: "var(--accent-indigo-light)", color: "var(--accent-indigo)" }}>
                  <Sparkles size={16} />
                </div>
              </div>
              <div className="kpi-value">42.8 <span style={{ fontSize: 14 }}>%</span></div>
              <div className="kpi-subtext">
                <span>325.9 T CO2/year eliminated</span>
              </div>
            </div>
          </section>

          {/* VIEW SWITCHER */}
          <AnimatePresence mode="wait">
            {activeTab === "cockpit" && (
              <motion.div
                key="cockpit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid-2">
                  {/* REAL-TIME ENERGY DISPATCH MATRIX WITH ANIMATED SANKEY FLOW */}
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        <Zap size={16} style={{ color: "var(--brand-cyan)" }} />
                        <span>Dynamic Microgrid Power Flux Matrix</span>
                      </div>
                      <span className="sec65b-pill">MILP 24h Rolling Dispatch</span>
                    </div>
                    <div className="card-body">
                      {/* Animated SVG Energy Stream Diagram */}
                      <div className="flow-sankey-box" style={{ background: "#F8FAFC", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                            REAL-TIME GENERATION-TO-LOAD ENERGY STREAMS
                          </span>
                          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--brand-cyan-dark)", fontWeight: 700 }}>
                            NET: {telemetry.total_generation_kw} kW / {telemetry.total_load_kw} kW
                          </span>
                        </div>

                        <svg viewBox="0 0 540 130" style={{ width: "100%", height: "auto" }}>
                          <defs>
                            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#F87171" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.9" />
                            </linearGradient>
                          </defs>

                          {/* Source Nodes */}
                          <rect x="10" y="10" width="110" height="26" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
                          <text x="65" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">Solar PV ({telemetry.solar_pv_kw} kW)</text>

                          <rect x="10" y="50" width="110" height="26" rx="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                          <text x="65" y="67" textAnchor="middle" fontSize="11" fontWeight="700" fill="#075985">Wind ({telemetry.wind_kw} kW)</text>

                          <rect x="10" y="90" width="110" height="26" rx="6" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
                          <text x="65" y="107" textAnchor="middle" fontSize="11" fontWeight="700" fill="#991B1B">Diesel DG ({telemetry.diesel_dg1_kw} kW)</text>

                          {/* Central Bus Bar */}
                          <rect x="230" y="15" width="60" height="100" rx="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                          <text x="260" y="58" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F172A">MICROGRID</text>
                          <text x="260" y="72" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0284C7">BUS 400V</text>

                          {/* Destination Loads */}
                          <rect x="400" y="10" width="130" height="26" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
                          <text x="465" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#166534">Life Support (38.5 kW)</text>

                          <rect x="400" y="50" width="130" height="26" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
                          <text x="465" y="67" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1E40AF">Science Lab (28.0 kW)</text>

                          <rect x="400" y="90" width="130" height="26" rx="6" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
                          <text x="465" y="107" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">Aux Base (22.0 kW)</text>

                          {/* Animated Stream Lines */}
                          <path d="M 120 23 C 170 23, 180 50, 230 50" fill="none" stroke="url(#amberGrad)" strokeWidth="3" strokeDasharray="6 4">
                            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                          </path>
                          <path d="M 120 63 C 170 63, 180 65, 230 65" fill="none" stroke="url(#cyanGrad)" strokeWidth="4" strokeDasharray="6 4">
                            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" />
                          </path>
                          <path d="M 120 103 C 170 103, 180 80, 230 80" fill="none" stroke="url(#redGrad)" strokeWidth="3.5" strokeDasharray="6 4">
                            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite" />
                          </path>

                          <path d="M 290 45 C 340 45, 350 23, 400 23" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeDasharray="6 4">
                            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.9s" repeatCount="indefinite" />
                          </path>
                          <path d="M 290 65 C 340 65, 350 63, 400 63" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="6 4">
                            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                          </path>
                          <path d="M 290 85 C 340 85, 350 103, 400 103" fill="none" stroke="#64748B" strokeWidth="2.5" strokeDasharray="6 4">
                            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.3s" repeatCount="indefinite" />
                          </path>
                        </svg>
                      </div>

                      <div className="flux-node-grid">
                        <div className="flux-node-card active" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
                          <div className="flux-node-title">
                            <span style={{ color: "#92400E" }}>Bifacial PV</span>
                            <Sun size={14} style={{ color: "#D97706" }} />
                          </div>
                          <div className="flux-node-val" style={{ color: "#B45309" }}>{telemetry.solar_pv_kw} kW</div>
                          <div style={{ fontSize: 11, color: "#78350F", marginTop: 4 }}>Albedo Snow Boost +38%</div>
                        </div>

                        <div className="flux-node-card active" style={{ borderColor: "#BAE6FD", background: "#F0F9FF" }}>
                          <div className="flux-node-title">
                            <span style={{ color: "#075985" }}>Cold Wind</span>
                            <Wind size={14} style={{ color: "#0284C7" }} />
                          </div>
                          <div className="flux-node-val" style={{ color: "#0369A1" }}>{telemetry.wind_kw} kW</div>
                          <div style={{ fontSize: 11, color: "#0C4A6E", marginTop: 4 }}>Pitch Ctrl @ {telemetry.wind_speed_ms} m/s</div>
                        </div>

                        <div className="flux-node-card active" style={{ borderColor: "#A7F3D0", background: "#ECFDF5" }}>
                          <div className="flux-node-title">
                            <span style={{ color: "#065F46" }}>LTO Battery</span>
                            <ThermometerSnowflake size={14} style={{ color: "#059669" }} />
                          </div>
                          <div className="flux-node-val" style={{ color: "#047857" }}>{telemetry.lto_battery_kw} kW</div>
                          <div style={{ fontSize: 11, color: "#064E3B", marginTop: 4 }}>-50°C Ready ({telemetry.lto_soc_pct}% SoC)</div>
                        </div>

                        <div className="flux-node-card active" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
                          <div className="flux-node-title">
                            <span style={{ color: "#991B1B" }}>CHP Diesel</span>
                            <Flame size={14} style={{ color: "#DC2626" }} />
                          </div>
                          <div className="flux-node-val" style={{ color: "#B91C1C" }}>{telemetry.diesel_dg1_kw} kW</div>
                          <div style={{ fontSize: 11, color: "#7F1D1D", marginTop: 4 }}>78% Exergy Cogeneration</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-TIER SOLID-STATE TRIAGE MATRIX */}
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        <Layers size={16} style={{ color: "var(--accent-indigo)" }} />
                        <span>Sub-20ms Solid-State Triage Priority</span>
                      </div>
                      <span className="sec65b-pill" style={{ color: "var(--accent-emerald)" }}>
                        <CheckCircle2 size={12} /> Hardware Arming Active
                      </span>
                    </div>
                    <div className="card-body">
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ padding: 14, borderRadius: "var(--radius-md)", border: "1px solid #BBF7D0", background: "#F0FDF4" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, color: "#166534" }}>
                            <span>Tier 1: Life Support & Habitat Heating</span>
                            <span>38.5 kW [IMMUTABLE]</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "#15803D", marginTop: 4 }}>
                            Medical bay, oxygen synthesis, hydronic primary circulation. Shedding strictly prohibited.
                          </div>
                        </div>

                        <div style={{ padding: 14, borderRadius: "var(--radius-md)", border: "1px solid #BFDBFE", background: "#EFF6FF" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, color: "#1E40AF" }}>
                            <span>Tier 2: Scientific Laboratories & LIDAR</span>
                            <span>28.0 kW [NORMAL]</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "#1D4ED8", marginTop: 4 }}>
                            Atmospheric LIDAR, seismic array, deep core ice drills. Graceful 300s hibernate sequence.
                          </div>
                        </div>

                        <div style={{ padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-surface)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, color: "var(--text-main)" }}>
                            <span>Tier 3: Auxiliary Kitchen & Domestic Waste</span>
                            <span>14.2 kW [STANDBY]</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                            Dishwashing sterilizers, waste compactors. Auto-shedding threshold at &lt;70% Battery SoC.
                          </div>
                        </div>

                        <div style={{ padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-surface)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, color: "var(--text-main)" }}>
                            <span>Tier 4: Non-Critical Outer Lighting</span>
                            <span>7.8 kW [SHED READY]</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                            Helipad floodlights, snow melting perimeter tracks. Hardware SSR instant sub-20ms trip.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3D DIGITAL TWIN VIEW */}
            {activeTab === "digital_twin_3d" && (
              <motion.div
                key="digital_twin_3d"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">
                      <Box size={16} style={{ color: "var(--brand-cyan)" }} />
                      <span>3D Polar Station Digital Twin & Interactive Orbital Engine</span>
                    </div>
                    <span className="sec65b-pill" style={{ color: "var(--brand-cyan-dark)" }}>
                      WebGL PBR Shaders + Live Energy Particle Stream
                    </span>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <PolarStation3DView telemetry={telemetry} stationCode={stationCode} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* INTERACTIVE MILP SOLVER SANDBOX */}
            {activeTab === "milp_sandbox" && (
              <motion.div
                key="milp_sandbox"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">
                      <Sliders size={16} style={{ color: "var(--brand-cyan)" }} />
                      <span>Interactive MILP Simplex Solver Sandbox</span>
                    </div>
                    <span className="sec65b-pill">Simplex Cost Frontier Engine</span>
                  </div>
                  <div className="card-body">
                    <div className="grid-2">
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Extreme Polar Climate Simulators</h4>
                        
                        <div className="control-group">
                          <div className="control-label-row">
                            <span>Ambient Temperature</span>
                            <span style={{ fontFamily: "var(--font-mono)", color: "var(--brand-cyan)" }}>{simTemp}°C</span>
                          </div>
                          <input
                            type="range"
                            min="-50"
                            max="5"
                            value={simTemp}
                            onChange={(e) => setSimTemp(Number(e.target.value))}
                            className="range-slider"
                          />
                        </div>

                        <div className="control-group">
                          <div className="control-label-row">
                            <span>Wind Speed Velocity</span>
                            <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-indigo)" }}>{simWind} m/s</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="45"
                            value={simWind}
                            onChange={(e) => setSimWind(Number(e.target.value))}
                            className="range-slider"
                          />
                        </div>

                        <div className="control-group">
                          <div className="control-label-row">
                            <span>Direct & Albedo Solar Irradiance</span>
                            <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-amber)" }}>{simSolar} W/m²</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="600"
                            value={simSolar}
                            onChange={(e) => setSimSolar(Number(e.target.value))}
                            className="range-slider"
                          />
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-subtle)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Simplex Optimal Microgrid Dispatch</h4>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                          <div style={{ background: "#FFF", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>CALCULATED LOAD</div>
                            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{simLoad} kW</div>
                          </div>
                          <div style={{ background: "#FFF", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>RENEWABLE CAPTURE</div>
                            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-emerald)" }}>{simRenewable} kW</div>
                          </div>
                          <div style={{ background: "#FFF", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>DIESEL INFEED REQUIRED</div>
                            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#DC2626" }}>{simDiesel} kW</div>
                          </div>
                          <div style={{ background: "#FFF", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>FUEL REDUCTION EFFICIENCY</div>
                            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--brand-cyan)" }}>{simFuelSaved}%</div>
                          </div>
                        </div>

                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                          <strong>MILP Objective Formulation:</strong> Minimize &int; [ C_fuel &times; m_f(t) + C_deg &times; P_bat&sup2;(t) + C_shed &times; P_shed(t) ] dt subject to -50&deg;C thermal jacket exergy balance.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KATABATIC SHOCK AI RADAR */}
            {activeTab === "katabatic" && (
              <motion.div
                key="katabatic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        <Wind size={16} style={{ color: "var(--brand-cyan)" }} />
                        <span>Barometric Shock Derivative (∂P/∂t)</span>
                      </div>
                      <span className="sec65b-pill">Threshold: -1.0 hPa/hr</span>
                    </div>
                    <div className="card-body">
                      <div className="oscillo-screen">
                        <svg className="oscillo-grid" viewBox="0 0 400 180">
                          <line x1="0" y1="45" x2="400" y2="45" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="90" x2="400" y2="90" stroke="#334155" strokeWidth="1" />
                          <line x1="0" y1="135" x2="400" y2="135" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="100" y1="0" x2="100" y2="180" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="200" y1="0" x2="200" y2="180" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="300" y1="0" x2="300" y2="180" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                          
                          <path
                            d="M 0 70 Q 50 65, 100 75 T 200 85 T 280 120 T 340 145 T 400 150"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="2.5"
                          />
                          <circle cx="400" cy="150" r="4" fill="#38BDF8" />
                        </svg>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 8 }}>
                          <span>T - 180 min (994.2 hPa)</span>
                          <span style={{ color: "#F87171" }}>CURRENT: {telemetry.dp_dt_30min} hPa/30min</span>
                          <span>NOW</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        <Compass size={16} style={{ color: "var(--accent-indigo)" }} />
                        <span>Pre-Soak Early Warning State</span>
                      </div>
                      <span className="sec65b-pill" style={{ color: telemetry.katabatic_alert ? "#DC2626" : "var(--accent-emerald)" }}>
                        {telemetry.katabatic_alert ? "PRE-SOAK ACTIVE" : "NOMINAL GRADIENT"}
                      </span>
                    </div>
                    <div className="card-body">
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>Onset Probability</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--brand-cyan)" }}>
                            {(telemetry.katabatic_prob * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>Hydronic Pre-Heating Advance</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700 }}>
                            180 Minutes Early
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                          When barometric pressure gradient dP/dt &lt; -1.0 hPa/hr, the AI initiates thermal pre-soaking of habitat thermal mass before wind gusts reach &gt;35 m/s cut-out thresholds.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DUAL-VECTOR EXERGY VIEW */}
            {activeTab === "exergy" && (
              <motion.div
                key="exergy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">
                      <Flame size={16} style={{ color: "#DC2626" }} />
                      <span>Dual-Vector Hydronic Exergy Heat Balance</span>
                    </div>
                    <span className="sec65b-pill">Overall Exergy Efficiency: 78.4%</span>
                  </div>
                  <div className="card-body">
                    <div className="grid-3">
                      <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", borderTop: "3px solid #DC2626" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>JACKET WATER LOOP</div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#DC2626", margin: "6px 0" }}>
                          31.4 kWth
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          85°C Inflow / 65°C Return (Ethylene Glycol 60/40)
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", borderTop: "3px solid var(--accent-amber)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>EXHAUST GAS HEAT EXCHANGER</div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-amber)", margin: "6px 0" }}>
                          42.1 kWth
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          380°C Flue Gas &rarr; 120°C Condensation Protection
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", borderTop: "3px solid var(--accent-emerald)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>THERMAL STORAGE BUFFER</div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-emerald)", margin: "6px 0" }}>
                          2,500 L
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          Stratified Buffer Tank @ 82°C Mean Core Temp
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CRYO LTO BATTERY MANAGEMENT */}
            {activeTab === "battery_lto" && (
              <motion.div
                key="battery_lto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">
                      <ThermometerSnowflake size={16} style={{ color: "var(--accent-emerald)" }} />
                      <span>Cryogenic Lithium Titanate (LTO) Cell Management Matrix</span>
                    </div>
                    <span className="sec65b-pill">Operating Range: -50°C to +55°C</span>
                  </div>
                  <div className="card-body">
                    <div className="grid-2">
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>4-Pack Cell Voltage & Impedance</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {[1, 2, 3, 4].map((cell) => (
                            <div key={cell} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                              <span style={{ fontWeight: 600, fontSize: 13 }}>Cell Bank #{cell}</span>
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>2.41 V | 0.82 mΩ</span>
                              <span style={{ color: "var(--accent-emerald)", fontSize: 12, fontWeight: 700 }}>BALANCED</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-subtle)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Zero Thermal Runaway & High C-Rate</h4>
                        <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                          Lithium Titanate (Li4Ti5O12) spinel anode operates at 1.55V vs Li/Li+, preventing lithium dendrite plating at extreme sub-zero temperatures (down to -50°C) with over 20,000 cycle lifespan.
                        </p>
                        <div style={{ display: "flex", gap: 12 }}>
                          <span className="sec65b-pill" style={{ background: "#FFF" }}>Cycle Life: &gt;20,000</span>
                          <span className="sec65b-pill" style={{ background: "#FFF" }}>SEI Growth: 0.00%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* HIL OSCILLOSCOPE & MODBUS */}
            {activeTab === "hil_oscilloscope" && (
              <motion.div
                key="hil_oscilloscope"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        <Cpu size={16} style={{ color: "var(--accent-indigo)" }} />
                        <span>Sub-20ms Solid-State Relay Trigger Oscilloscope</span>
                      </div>
                      <span className="sec65b-pill">Trip Time: 14.8 ms</span>
                    </div>
                    <div className="card-body">
                      <div className="oscillo-screen">
                        <svg className="oscillo-grid" viewBox="0 0 400 180">
                          <line x1="0" y1="90" x2="400" y2="90" stroke="#334155" strokeWidth="1" />
                          <line x1="200" y1="0" x2="200" y2="180" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 4" />
                          
                          <path
                            d="M 0 90 L 190 90 L 195 20 L 205 160 L 210 90 L 400 90"
                            fill="none"
                            stroke="#4ADE80"
                            strokeWidth="2.5"
                          />
                        </svg>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 8 }}>
                          <span>T0: Brownout Detect (0ms)</span>
                          <span style={{ color: "#4ADE80" }}>SSR OPENED @ 14.8ms</span>
                          <span>GRID STABILIZED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        <Radio size={16} style={{ color: "var(--brand-cyan)" }} />
                        <span>Modbus RTU / RS-485 Hex Stream</span>
                      </div>
                      <span className="sec65b-pill">Baud: 115200 8-N-1</span>
                    </div>
                    <div className="card-body">
                      <div style={{ background: "#0F172A", padding: 14, borderRadius: "var(--radius-md)", color: "#38BDF8", fontFamily: "var(--font-mono)", fontSize: 11.5, height: 220, overflowY: "auto" }}>
                        <div>[TX] 01 03 00 00 00 08 44 0C (Read Station Power Registers)</div>
                        <div style={{ color: "#4ADE80" }}>[RX] 01 03 10 00 59 00 12 00 26 00 00 00 00 00 86 52 A1</div>
                        <div>[TX] 01 06 00 10 00 01 48 0F (Command SSR Trip Tier 4)</div>
                        <div style={{ color: "#4ADE80" }}>[RX] 01 06 00 10 00 01 48 0F (ACK Sub-20ms Tripped)</div>
                        <div>[TX] 01 03 00 20 00 04 45 C0 (Read Cryo Cell Voltages)</div>
                        <div style={{ color: "#4ADE80" }}>[RX] 01 03 08 09 6A 09 6A 09 6A 09 6A A3 4D (All 2.41V)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
