"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import {
  Activity,
  Zap,
  Flame,
  ThermometerSnowflake,
  Wind,
  Sun,
  Cpu,
  Layers,
  Sliders,
  Gauge,
  CheckCircle2,
  Sparkles,
  Compass,
  Radio,
  Box
} from "lucide-react";

// Client-only dynamic import for Three.js 3D Digital Twin
const Polar3DTwin = dynamic(() => import("../../components/Polar3DTwin"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 520, display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F5F9", borderRadius: 16 }}>
      <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>Loading Three.js Polar Digital Twin...</span>
    </div>
  )
});

export default function CockpitPage() {
  const [stationCode, setStationCode] = useState("BHARATI");
  const [activeTab, setActiveTab] = useState("cockpit");
  const [telemetry, setTelemetry] = useState({
    timestamp: new Date().toISOString(),
    station: "Bharati Station (Antarctica)",
    fsm_state: "COGEN_BALANCED",
    ambient_temp_c: -28.4,
    wind_speed_ms: 18.2,
    solar_pv_kw: 18.5,
    wind_kw: 32.4,
    diesel_dg1_kw: 38.2,
    lto_battery_kw: 12.0,
    lto_soc_pct: 86.4,
    total_generation_kw: 89.1,
    total_load_kw: 88.5,
    thermal_recovered_kw: 73.5,
    hydronic_supply_temp_c: 84.2,
    hydronic_return_temp_c: 63.8,
    dp_dt_30min: -1.2,
    fuel_reduction_pct: 42.8
  });

  const [simTemp, setSimTemp] = useState(-28);
  const [simWind, setSimWind] = useState(18);
  const [simSolar, setSimSolar] = useState(240);

  useEffect(() => {
    fetch(`/api/telemetry?station=${stationCode}&temp=${simTemp}&wind=${simWind}&solar=${simSolar}`)
      .then((res) => res.json())
      .then((data) => setTelemetry((prev) => ({ ...prev, ...data })))
      .catch((err) => console.warn("API fallback active", err));
  }, [stationCode, simTemp, simWind, simSolar]);

  const simRenewable = ((simSolar * 0.08) + Math.pow(Math.min(simWind, 25), 2.2) * 0.04).toFixed(1);
  const simLoad = (70 + (Math.abs(simTemp) * 0.6)).toFixed(1);
  const simDiesel = Math.max(0, (simLoad - simRenewable)).toFixed(1);
  const simFuelSaved = (100 - (simDiesel / simLoad) * 100).toFixed(1);

  return (
    <div className="gateway-root">
      <Navbar activePage="cockpit" />

      {/* SUBBAR */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid var(--border-color)", padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <select
            value={stationCode}
            onChange={(e) => setStationCode(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-subtle)", fontWeight: 700, fontSize: 13, outline: "none" }}
          >
            <option value="BHARATI">Bharati Station (Antarctica, 69.407°S)</option>
            <option value="HIMADRI">Himadri Station (Arctic, 78.924°N)</option>
            <option value="MAITRI">Maitri Station (Antarctica, 70.766°S)</option>
          </select>

          <span className="sec65b-pill" style={{ color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <Activity size={13} /> FSM: {telemetry.fsm_state}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {["cockpit", "digital_twin_3d", "milp_sandbox", "katabatic", "exergy"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn-preset ${activeTab === tab ? "active" : ""}`}
              style={{ textTransform: "capitalize" }}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: 28, width: "100%" }}>
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
            <div className="kpi-subtext"><Sun size={12} style={{ color: "var(--accent-amber)" }} /> PV: {telemetry.solar_pv_kw} kW | <Wind size={12} style={{ color: "var(--brand-cyan)" }} /> Wind: {telemetry.wind_kw} kW</div>
          </div>

          <div className="kpi-card" style={{ borderLeft: "4px solid var(--accent-amber)" }}>
            <div className="kpi-header">
              <span className="kpi-title">Diesel DG Baseline</span>
              <div className="kpi-icon-badge" style={{ background: "var(--accent-amber-light)", color: "var(--accent-amber)" }}>
                <Gauge size={16} />
              </div>
            </div>
            <div className="kpi-value">{telemetry.diesel_dg1_kw.toFixed(1)} <span style={{ fontSize: 14 }}>kW</span></div>
            <div className="kpi-subtext"><Flame size={12} /> DG1: 78.4% Load Factor (Optimal)</div>
          </div>

          <div className="kpi-card" style={{ borderLeft: "4px solid #DC2626" }}>
            <div className="kpi-header">
              <span className="kpi-title">Hydronic Exergy</span>
              <div className="kpi-icon-badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                <Flame size={16} />
              </div>
            </div>
            <div className="kpi-value">{telemetry.thermal_recovered_kw.toFixed(1)} <span style={{ fontSize: 14 }}>kWth</span></div>
            <div className="kpi-subtext"><span>Supply: {telemetry.hydronic_supply_temp_c}°C | Return: {telemetry.hydronic_return_temp_c}°C</span></div>
          </div>

          <div className="kpi-card" style={{ borderLeft: "4px solid var(--accent-emerald)" }}>
            <div className="kpi-header">
              <span className="kpi-title">Cryo LTO Battery</span>
              <div className="kpi-icon-badge" style={{ background: "var(--accent-emerald-light)", color: "var(--accent-emerald)" }}>
                <ThermometerSnowflake size={16} />
              </div>
            </div>
            <div className="kpi-value">{telemetry.lto_soc_pct.toFixed(1)} <span style={{ fontSize: 14 }}>%</span></div>
            <div className="kpi-subtext"><span>Flow: +{telemetry.lto_battery_kw} kW (Chg)</span></div>
          </div>

          <div className="kpi-card" style={{ borderLeft: "4px solid var(--accent-indigo)" }}>
            <div className="kpi-header">
              <span className="kpi-title">Fuel Cut / Decarb</span>
              <div className="kpi-icon-badge" style={{ background: "var(--accent-indigo-light)", color: "var(--accent-indigo)" }}>
                <Sparkles size={16} />
              </div>
            </div>
            <div className="kpi-value">42.8 <span style={{ fontSize: 14 }}>%</span></div>
            <div className="kpi-subtext"><span>325.9 T CO2/year eliminated</span></div>
          </div>
        </section>

        {/* ACTIVE VIEW */}
        {activeTab === "cockpit" && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Zap size={16} style={{ color: "var(--brand-cyan)" }} /><span>Dynamic Microgrid Power Flux</span></div>
                <span className="sec65b-pill">Next.js Serverless Dynamic Sync</span>
              </div>
              <div className="card-body">
                {/* SVG Flow */}
                <div style={{ background: "#F8FAFC", border: "1px solid var(--border-color)", borderRadius: 10, padding: 16, marginBottom: 18 }}>
                  <svg viewBox="0 0 540 130" style={{ width: "100%", height: "auto" }}>
                    <rect x="10" y="10" width="110" height="26" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
                    <text x="65" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">Solar PV ({telemetry.solar_pv_kw} kW)</text>
                    <rect x="10" y="50" width="110" height="26" rx="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                    <text x="65" y="67" textAnchor="middle" fontSize="11" fontWeight="700" fill="#075985">Wind ({telemetry.wind_kw} kW)</text>
                    <rect x="10" y="90" width="110" height="26" rx="6" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
                    <text x="65" y="107" textAnchor="middle" fontSize="11" fontWeight="700" fill="#991B1B">Diesel DG ({telemetry.diesel_dg1_kw} kW)</text>
                    <rect x="230" y="15" width="60" height="100" rx="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                    <text x="260" y="58" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F172A">MICROGRID</text>
                    <text x="260" y="72" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0284C7">BUS 400V</text>
                    <rect x="400" y="10" width="130" height="26" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
                    <text x="465" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#166534">Life Support (38.5 kW)</text>
                    <rect x="400" y="50" width="130" height="26" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
                    <text x="465" y="67" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1E40AF">Science Lab (28.0 kW)</text>
                    <rect x="400" y="90" width="130" height="26" rx="6" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
                    <text x="465" y="107" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">Base Aux (22.0 kW)</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title"><Layers size={16} style={{ color: "var(--accent-indigo)" }} /><span>Sub-20ms Solid-State Triage</span></div>
                <span className="sec65b-pill" style={{ color: "var(--accent-emerald)" }}><CheckCircle2 size={12} /> Hardware Arming Active</span>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#166534" }}>Tier 1: Life Support & Heating (38.5 kW) [IMMUTABLE]</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1E40AF" }}>Tier 2: Science Laboratories & LIDAR (28.0 kW) [NORMAL]</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: "#FFFFFF", border: "1px solid var(--border-color)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Tier 3: Auxiliary Kitchen (14.2 kW) [STANDBY]</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: "#FFFFFF", border: "1px solid var(--border-color)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Tier 4: Perimeter Lighting (7.8 kW) [SHED READY]</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "digital_twin_3d" && (
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Box size={16} style={{ color: "var(--brand-cyan)" }} /><span>3D Polar Station Digital Twin WebGL Engine</span></div>
              <span className="sec65b-pill">Next.js Three.js Client Component</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <Polar3DTwin telemetry={telemetry} stationCode={stationCode} />
            </div>
          </div>
        )}

        {activeTab === "milp_sandbox" && (
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Sliders size={16} style={{ color: "var(--brand-cyan)" }} /><span>Serverless Simplex MILP Solver Sandbox</span></div>
              <span className="sec65b-pill">Next.js Edge API Engine</span>
            </div>
            <div className="card-body">
              <div className="grid-2">
                <div>
                  <div className="control-group">
                    <div className="control-label-row"><span>Ambient Temperature</span><span>{simTemp}°C</span></div>
                    <input type="range" min="-50" max="5" value={simTemp} onChange={(e) => setSimTemp(Number(e.target.value))} className="range-slider" />
                  </div>
                  <div className="control-group">
                    <div className="control-label-row"><span>Wind Velocity</span><span>{simWind} m/s</span></div>
                    <input type="range" min="0" max="45" value={simWind} onChange={(e) => setSimWind(Number(e.target.value))} className="range-slider" />
                  </div>
                  <div className="control-group">
                    <div className="control-label-row"><span>Solar Irradiance</span><span>{simSolar} W/m²</span></div>
                    <input type="range" min="0" max="600" value={simSolar} onChange={(e) => setSimSolar(Number(e.target.value))} className="range-slider" />
                  </div>
                </div>
                <div style={{ background: "var(--bg-subtle)", padding: 20, borderRadius: 12 }}>
                  <h4 style={{ fontWeight: 800, marginBottom: 12 }}>Simplex Optimization Frontier</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#FFF", padding: 10, borderRadius: 8 }}><div>LOAD</div><strong>{simLoad} kW</strong></div>
                    <div style={{ background: "#FFF", padding: 10, borderRadius: 8 }}><div>RENEWABLE</div><strong style={{ color: "var(--accent-emerald)" }}>{simRenewable} kW</strong></div>
                    <div style={{ background: "#FFF", padding: 10, borderRadius: 8 }}><div>DIESEL REQ</div><strong style={{ color: "#DC2626" }}>{simDiesel} kW</strong></div>
                    <div style={{ background: "#FFF", padding: 10, borderRadius: 8 }}><div>SAVINGS</div><strong style={{ color: "var(--brand-cyan)" }}>{simFuelSaved}%</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "katabatic" && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><div className="card-title"><Wind size={16} /><span>Barometric Pressure Gradient (∂P/∂t)</span></div></div>
              <div className="card-body">
                <div className="oscillo-screen">
                  <svg className="oscillo-grid" viewBox="0 0 400 180">
                    <path d="M 0 70 Q 50 65, 100 75 T 200 85 T 280 120 T 340 145 T 400 150" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title"><Compass size={16} /><span>Thermal Pre-Soak Early Warning</span></div></div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  When barometric pressure derivative dP/dt &lt; -1.0 hPa/hr, automated 180-minute thermal pre-soaking initiates before 45 m/s katabatic wind gusts trip turbines.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "exergy" && (
          <div className="card">
            <div className="card-header"><div className="card-title"><Flame size={16} /><span>Dual-Vector Hydronic Exergy Thermal Balance</span></div></div>
            <div className="card-body">
              <div className="grid-3">
                <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: 10, borderTop: "3px solid #DC2626" }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>JACKET WATER LOOP</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#DC2626", margin: "6px 0" }}>31.4 kWth</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>85°C Supply / 65°C Return</div>
                </div>
                <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: 10, borderTop: "3px solid var(--accent-amber)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>EXHAUST FLUE GAS</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-amber)", margin: "6px 0" }}>42.1 kWth</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>380°C to 120°C Heat Exchanger</div>
                </div>
                <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: 10, borderTop: "3px solid var(--accent-emerald)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>STORAGE BUFFER</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-emerald)", margin: "6px 0" }}>2,500 L</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Stratified Storage Tank @ 82°C</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
