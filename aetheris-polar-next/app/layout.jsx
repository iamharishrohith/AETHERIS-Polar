import "./globals.css";

export const metadata = {
  title: "AETHERIS-POLAR // Next.js Serverless Polar Microgrid",
  description: "Autonomous Extreme-climate Thermal & Hybrid Energy Resilience Intelligence System for India's Polar Research Stations (Bharati & Himadri) - SIH 26061 MoES / NCPOR",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
