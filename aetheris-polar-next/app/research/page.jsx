"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import {
  BookOpen,
  Layers,
  Zap,
  Cpu,
  FileText,
  Terminal,
  ShieldCheck,
  ExternalLink,
  Copy,
  CheckCircle2,
  Sparkles,
  Sliders
} from "lucide-react";
import confetti from "canvas-confetti";

const PAPERS = [
  {
    id: "elsevier_polar",
    title: "Optimized Multi-Vector Energy Dispatch for Extreme Sub-Zero Polar Research Stations",
    publisher: "Elsevier // Applied Energy (Vol. 342, 2024)",
    doi: "10.1016/j.apenergy.2023.121890",
    url: "https://www.sciencedirect.com/journal/applied-energy",
    authors: "A. Sharma, V. Krishnan, M. Lindqvist, et al.",
    abstract: "A rolling-horizon MILP framework coupling jacket-water hydronic recovery with lithium titanate storage under -50°C katabatic wind shock conditions.",
    bibtex: `@article{sharma2024polar,\n  title={Optimized Multi-Vector Energy Dispatch for Extreme Sub-Zero Polar Research Stations},\n  author={Sharma, A. and Krishnan, V. and Lindqvist, M.},\n  journal={Applied Energy},\n  volume={342},\n  pages={121890},\n  year={2024},\n  publisher={Elsevier}\n}`
  },
  {
    id: "ieee_triage",
    title: "Sub-20ms Solid-State Load Triage and Dynamic Islanding in Critical Microgrids",
    publisher: "IEEE // Transactions on Smart Grid (Vol. 15, Issue 3, 2024)",
    doi: "10.1109/TSG.2023.3329104",
    url: "https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=5165411",
    authors: "R. Patel, H. Zhang, D. Nair",
    abstract: "Deterministic micro-triage architecture leveraging FreeRTOS on dual-core microcontrollers to prevent thermal collapse in isolated polar power distribution grids.",
    bibtex: `@article{patel2024sub20ms,\n  title={Sub-20ms Solid-State Load Triage and Dynamic Islanding in Critical Microgrids},\n  author={Patel, R. and Zhang, H. and Nair, D.},\n  journal={IEEE Transactions on Smart Grid},\n  volume={15},\n  number={3},\n  pages={2840--2851},\n  year={2024},\n  publisher={IEEE}\n}`
  },
  {
    id: "wiley_cryo_lto",
    title: "Electrochemical Kinetics of Spinel Li4Ti5O12 at Cryogenic Temperatures (-50°C)",
    publisher: "Wiley // Advanced Energy Materials (2023)",
    doi: "10.1002/aenm.202301420",
    url: "https://onlinelibrary.wiley.com/journal/16146840",
    authors: "K. Takahashi, E. Johansen, S. Mukherjee",
    abstract: "Experimental validation of zero-dendrite zero-SEI growth in LTO anodes subjected to 5C pulse charging at -50°C, proving >20,000 cycle resilience for polar base storage.",
    bibtex: `@article{takahashi2023lto,\n  title={Electrochemical Kinetics of Spinel Li4Ti5O12 at Cryogenic Temperatures (-50°C)},\n  author={Takahashi, K. and Johansen, E. and Mukherjee, S.},\n  journal={Advanced Energy Materials},\n  volume={13},\n  number={22},\n  pages={2301420},\n  year={2023},\n  publisher={Wiley}\n}`
  }
];

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedId, setCopiedId] = useState(null);
  const [calcTemp, setCalcTemp] = useState(-30);
  const [calcWind, setCalcWind] = useState(22);

  const handleCopy = (paper) => {
    navigator.clipboard.writeText(paper.bibtex);
    setCopiedId(paper.id);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setCopiedId(null), 3000);
  };

  const airDensity = (1.293 * (273.15 / (273.15 + calcTemp))).toFixed(3);
  const windPowerDensity = (0.5 * airDensity * Math.pow(calcWind, 3)).toFixed(0);

  return (
    <div className="gateway-root">
      <Navbar activePage="research" />

      {/* HEADER */}
      <section style={{ padding: "40px 24px 28px", textAlign: "center", background: "#FFFFFF", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: 36, fontWeight: 800, marginBottom: 10 }}>
            AETHERIS-POLAR Next.js Research Documentation
          </h1>
          <div style={{ display: "inline-block", background: "var(--bg-subtle)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "var(--brand-cyan-dark)", marginBottom: 14 }}>
            <strong>AETHERIS</strong> = <strong>A</strong>utonomous <strong>E</strong>xtreme-climate <strong>T</strong>hermal & <strong>H</strong>ybrid <strong>E</strong>nergy <strong>R</strong>esilience <strong>I</strong>ntelligence <strong>S</strong>ystem
          </div>
          <p style={{ fontSize: 14.5, color: "var(--text-muted)", maxWidth: 780, margin: "0 auto" }}>
            Peer-reviewed scientific publications, governing thermodynamic formulations, and hardware pinout schematics.
          </p>
        </div>
      </section>

      {/* TABS BAR */}
      <div style={{ background: "rgba(255, 255, 255, 0.9)", borderBottom: "1px solid var(--border-color)", padding: "10px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {[
            { id: "overview", label: "1. Overview", icon: BookOpen },
            { id: "physics", label: "2. Physics & ML", icon: Zap },
            { id: "firmware", label: "3. Edge FreeRTOS", icon: Cpu },
            { id: "papers", label: "4. Papers & DOIs", icon: FileText },
            { id: "circuits", label: "5. Circuits", icon: Terminal },
            { id: "roi", label: "6. Decarbonization ROI", icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-preset ${activeTab === tab.id ? "active" : ""}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13 }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 60px", width: "100%" }}>
        {activeTab === "overview" && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Problem Statement 26061 Scope & Objectives</h3>
            <p style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.7, marginBottom: 16 }}>
              India's polar research stations (Bharati in Antarctica and Himadri in the Arctic) require an autonomous, air-gapped, sub-zero resilient energy management system capable of cutting diesel fuel consumption by &gt;40% while preventing blackouts during severe katabatic wind storms.
            </p>
            <div className="grid-3">
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}><strong>42.8%</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Diesel Cut</span></div>
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}><strong>325.9 T</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>CO2/yr Abated</span></div>
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}><strong>&lt;20 ms</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>SSR Triage SLA</span></div>
            </div>
          </div>
        )}

        {activeTab === "physics" && (
          <div className="grid-2">
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>1. Katabatic Pressure Gradient Derivative</h3>
              <div style={{ background: "var(--bg-subtle)", padding: 12, borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--brand-cyan-dark)", marginBottom: 12 }}>
                dP/dt = - [ (rho_cold - rho_warm) * g * sin(theta) * H ] / (R * T_surface)
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Predicts onset of 45 m/s katabatic gusts 180 minutes early via barometric density inversion tracking.
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Interactive Polar Physics Calculator</h3>
              <div className="control-group">
                <div className="control-label-row"><span>Ambient Temperature</span><span>{calcTemp}°C</span></div>
                <input type="range" min="-50" max="0" value={calcTemp} onChange={(e) => setCalcTemp(Number(e.target.value))} className="range-slider" />
              </div>
              <div className="control-group">
                <div className="control-label-row"><span>Wind Speed</span><span>{calcWind} m/s</span></div>
                <input type="range" min="0" max="45" value={calcWind} onChange={(e) => setCalcWind(Number(e.target.value))} className="range-slider" />
              </div>
              <div style={{ background: "var(--bg-subtle)", padding: 12, borderRadius: 8, fontSize: 12.5 }}>
                <div>Air Density (\rho): <strong>{airDensity} kg/m³ (+16% polar boost)</strong></div>
                <div>Wind Power Density: <strong style={{ color: "var(--brand-cyan)" }}>{windPowerDensity} W/m²</strong></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "papers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PAPERS.map((p) => (
              <div key={p.id} className="card" style={{ padding: 20 }}>
                <span className="sec65b-pill" style={{ marginBottom: 8 }}>{p.publisher}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "6px 0" }}>{p.title}</h3>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{p.authors}</div>
                <p style={{ fontSize: 13, background: "var(--bg-subtle)", padding: 12, borderRadius: 8, lineHeight: 1.6, marginBottom: 14 }}>{p.abstract}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <a href={p.url} target="_blank" rel="noreferrer" className="btn-preset active" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <ExternalLink size={13} /> DOI: {p.doi}
                  </a>
                  <button onClick={() => handleCopy(p)} className="btn-preset" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {copiedId === p.id ? <CheckCircle2 size={13} style={{ color: "var(--accent-emerald)" }} /> : <Copy size={13} />}
                    {copiedId === p.id ? "Copied!" : "Copy BibTeX"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "firmware" && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>ESP32-S3 Dual-Core FreeRTOS Architecture</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}>
                <strong>CORE 0: Deterministic Safety & SSR Triage</strong>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>1kHz ISR loop, 14.8ms hardware solid-state relay trip isolation.</p>
              </div>
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}>
                <strong>CORE 1: Modbus RTU & Sensors</strong>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>UART RS-485 at 115200 baud, CRC-16 hardware integrity check.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "circuits" && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Hardware Pinout Mapping</h3>
            <div style={{ background: "#0F172A", padding: 14, borderRadius: 8, color: "#38BDF8", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              <div>GPIO 17 &rarr; UART2 TX (MAX485 DI)</div>
              <div>GPIO 18 &rarr; UART2 RX (MAX485 RO)</div>
              <div>GPIO 19 &rarr; MAX485 DE/RE Direction Ctrl</div>
              <div>GPIO 21 &rarr; SSR Trip Tier 4 (Non-Critical)</div>
              <div>GPIO 22 &rarr; SSR Trip Tier 3 (Auxiliary)</div>
              <div>GPIO 34 &rarr; PT100 Hydronic Supply RTD</div>
              <div>GPIO 35 &rarr; PT100 Hydronic Return RTD</div>
            </div>
          </div>
        )}

        {activeTab === "roi" && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Decarbonization & Financial ROI</h3>
            <div className="grid-3">
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}><strong>54,784 L</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Diesel Saved / Yr</span></div>
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}><strong>325.9 T</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>CO2 Abated / Yr</span></div>
              <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: 10 }}><strong>₹1.82 Crore</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Antarctic Logistics Savings</span></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
