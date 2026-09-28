import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    system: "AETHERIS-POLAR Next.js Serverless Microgrid Engine",
    version: "2.0.0-serverless",
    sih_problem_id: 26061,
    ministry: "Ministry of Earth Sciences (MoES) // NCPOR",
    timestamp: new Date().toISOString(),
    stations: [
      {
        code: "BHARATI",
        name: "Bharati Station (Larsemann Hills, Antarctica)",
        fsm_state: "COGEN_BALANCED",
        ambient_temp_c: -28.4,
        wind_speed_ms: 18.2,
        load_kw: 88.5,
        renewable_infeed_kw: 50.9,
        diesel_baseline_kw: 38.2,
        hydronic_exergy_kwth: 73.5,
        fuel_reduction_pct: 42.8,
        co2_abated_tons_yr: 325.9
      },
      {
        code: "HIMADRI",
        name: "Himadri Station (Ny-Ålesund, Arctic)",
        fsm_state: "OPTIMAL_DISPATCH",
        ambient_temp_c: -14.2,
        wind_speed_ms: 12.5,
        load_kw: 64.5,
        renewable_infeed_kw: 41.2,
        diesel_baseline_kw: 23.3,
        hydronic_exergy_kwth: 52.0,
        fuel_reduction_pct: 44.1,
        co2_abated_tons_yr: 218.4
      }
    ],
    serverless_runtime: "Edge / Node.js 18+ (Cold start <5ms)"
  };
  return NextResponse.json(data);
}
