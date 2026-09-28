import Link from "next/link";
import { Zap, Activity, Server, GitBranch, Box } from "lucide-react";

export default function Navbar({ activePage }) {
  return (
    <header className="gateway-navbar">
      <Link href="/" className="navbar-brand">
        <img src="/logo.jpg" alt="AETHERIS Logo" />
        <div>
          <div className="navbar-brand-text">AETHERIS-POLAR</div>
          <div className="navbar-brand-sub">Next.js Serverless Microgrid</div>
        </div>
      </Link>

      <nav className="nav-links">
        <Link href="/" className={`nav-link-btn ${activePage === "gateway" ? "active" : ""}`}>
          <Zap size={14} />
          <span>Gateway</span>
        </Link>

        <Link href="/cockpit" className={`nav-link-btn ${activePage === "cockpit" ? "active" : ""}`}>
          <Activity size={14} />
          <span>Operations Cockpit</span>
        </Link>

        <a
          href="/api/telemetry"
          target="_blank"
          className="nav-link-btn"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
        >
          <Server size={13} />
          <span>/api/telemetry</span>
        </a>

        <a
          href="https://github.com/iamharishrohith/AETHERIS-Polar.git"
          target="_blank"
          rel="noreferrer"
          className="nav-link-btn"
        >
          <GitBranch size={13} />
          <span>GitHub Docs & Code</span>
        </a>
      </nav>
    </header>
  );
}
