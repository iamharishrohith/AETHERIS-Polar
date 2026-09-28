import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  Zap,
  Activity,
  Server,
  Globe,
  ArrowRight,
  GitBranch,
  Sparkles,
  Sliders,
  Box,
  ShieldCheck,
  Cpu
} from "lucide-react";

const STATIONS = [
  { code: "BHARATI", name: "Bharati Station", location: "Larsemann Hills, Antarctica", coords: "69.407° S, 76.191° E", temp: "-28.4°C", load: "89.1 kW", decarb: "42.8%", status: "COGEN BALANCED" },
  { code: "HIMADRI", name: "Himadri Station", location: "Ny-Ålesund, Svalbard, Arctic", coords: "78.924° N, 11.928° E", temp: "-14.2°C", load: "64.5 kW", decarb: "44.1%", status: "OPTIMAL DISPATCH" },
  { code: "MAITRI", name: "Maitri Station", location: "Schirmacher Oasis, Antarctica", coords: "70.766° S, 11.733° E", temp: "-32.1°C", load: "76.8 kW", decarb: "39.5%", status: "ISLANDING READY" },
  { code: "INDARC", name: "IndARC Observatory", location: "Kongsfjorden Fjord, Arctic", coords: "78.9° N, 12.0° E", temp: "-1.8°C", load: "12.4 kW", decarb: "68.2%", status: "SUBOUTPOST ONLINE" }
];

export default function GatewayPage() {
  return (
    <div className="gateway-root">
      <Navbar activePage="gateway" />

      {/* HERO */}
      <section style={{ padding: "48px 24px 36px", textAlign: "center", background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <img
              src="/logo.jpg"
              alt="AETHERIS Logo"
              style={{
                width: 96,
                height: 96,
                borderRadius: 22,
                boxShadow: "0 10px 25px -4px rgba(2, 132, 199, 0.35)",
                border: "2px solid #FFF"
              }}
            />
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--brand-cyan-light)", color: "var(--brand-cyan-dark)", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, marginBottom: 16, border: "1px solid rgba(2, 132, 199, 0.2)" }}>
            <Sparkles size={13} />
            <span>SIH 2026 // MoES & NCPOR Problem Statement 26061</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-title)", fontSize: 40, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.03em", marginBottom: 12 }}>
            AETHERIS-POLAR Operations Gateway
          </h1>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border-strong)", fontSize: 13, fontWeight: 600, color: "var(--text-main)", boxShadow: "var(--shadow-sm)", marginBottom: 18 }}>
            <span><strong>A</strong>utonomous</span> &bull;
            <span><strong>E</strong>xtreme-climate</span> &bull;
            <span><strong>T</strong>hermal &</span> &bull;
            <span><strong>H</strong>ybrid</span> &bull;
            <span><strong>E</strong>nergy</span> &bull;
            <span><strong>R</strong>esilience</span> &bull;
            <span><strong>I</strong>ntelligence</span> &bull;
            <span><strong>S</strong>ystem</span>
          </div>

          <p style={{ fontSize: 15.5, color: "var(--text-muted)", maxWidth: 820, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Autonomous extreme-climate polar microgrid solution engineered for Indian Research Stations in Antarctica (Bharati, Maitri) and the Arctic (Himadri). Real-time 3D WebGL Digital Twin, automated Simplex LP dispatch, and zero-dendrite -50°C cryogenic LTO battery management.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="sec65b-pill" style={{ background: "#FFF" }}><span className="pulse-dot"></span> Next.js 15 Serverless Architecture</div>
            <div className="sec65b-pill" style={{ background: "#FFF" }}><span className="pulse-dot"></span> Three.js WebGL 3D Digital Twin</div>
            <div className="sec65b-pill" style={{ background: "#FFF" }}><span className="pulse-dot"></span> Sub-20ms SSR Triage Engine</div>
          </div>
        </div>
      </section>

      {/* LAUNCHPAD */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 60px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-title)", fontSize: 22, fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={22} style={{ color: "var(--brand-cyan)" }} />
            <span>Operations Solution Suites</span>
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Select an operational interface to deploy</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 40 }}>
          {/* COCKPIT */}
          <Link href="/cockpit" className="card" style={{ textDecoration: "none", color: "inherit", padding: 26, borderTop: "4px solid var(--brand-cyan)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-cyan-light)", color: "var(--brand-cyan-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={22} />
              </div>
              <span className="sec65b-pill">/cockpit</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Operations Cockpit & 3D Twin</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Interactive Three.js 3D WebGL Digital Twin of Bharati Polar Station with procedural snow shaders, animated SVG dynamic energy streams, and real-time Simplex MILP microgrid sandbox.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, color: "var(--brand-cyan)", fontSize: 13.5 }}>
              <span>Launch Operations Cockpit</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          {/* SERVERLESS TELEMETRY API */}
          <a href="/api/telemetry" target="_blank" className="card" style={{ textDecoration: "none", color: "inherit", padding: 26, borderTop: "4px solid var(--accent-emerald)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-emerald-light)", color: "var(--accent-emerald)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Server size={22} />
              </div>
              <span className="sec65b-pill">/api/telemetry</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Serverless Physics Telemetry API</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Native Serverless Edge route executing real-time temperature-dependent air density calculations, +38% bifacial solar snow albedo gain, and cryogenic LTO battery state-of-charge.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, color: "var(--accent-emerald)", fontSize: 13.5 }}>
              <span>Inspect Live Telemetry JSON</span>
              <ArrowRight size={16} />
            </div>
          </a>

          {/* GITHUB REPO & DOCS */}
          <a href="https://github.com/iamharishrohith/AETHERIS-Polar.git" target="_blank" rel="noreferrer" className="card" style={{ textDecoration: "none", color: "inherit", padding: 26, borderTop: "4px solid var(--accent-indigo)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-indigo-light)", color: "var(--accent-indigo)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GitBranch size={22} />
              </div>
              <span className="sec65b-pill">GitHub Repository</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Engineering Code & Documentation</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Complete open-source repository containing C/FreeRTOS embedded firmware, hardware pinout diagrams, mathematical proofs, and technical specifications.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, color: "var(--accent-indigo)", fontSize: 13.5 }}>
              <span>View Repository on GitHub</span>
              <ArrowRight size={16} />
            </div>
          </a>
        </div>

        {/* FLEET MONITORING */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-title)", fontSize: 22, fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 10 }}>
            <Globe size={22} style={{ color: "var(--brand-cyan)" }} />
            <span>Multi-Station Polar Fleet Monitoring</span>
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>MoES / NCPOR Network Telemetry</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 18 }}>
          {STATIONS.map((st) => (
            <div key={st.code} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{st.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{st.location}</div>
                </div>
                <span className="sec65b-pill" style={{ background: "var(--brand-cyan-light)", color: "var(--brand-cyan-dark)" }}>{st.status}</span>
              </div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 12 }}>{st.coords}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "var(--bg-subtle)", padding: "8px 10px", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>TEMP</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--brand-cyan)" }}>{st.temp}</div>
                </div>
                <div style={{ background: "var(--bg-subtle)", padding: "8px 10px", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>LOAD</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{st.load}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ background: "#FFF", borderTop: "1px solid var(--border-color)", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: "var(--text-muted)" }}>
        <div><strong>AETHERIS-POLAR</strong> // Next.js Serverless Microgrid Solution (SIH 26061)</div>
        <div>Ministry of Earth Sciences (MoES) &bull; NCPOR</div>
      </footer>
    </div>
  );
}
