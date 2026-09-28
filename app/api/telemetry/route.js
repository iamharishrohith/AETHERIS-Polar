import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get('station') || 'BHARATI';
  const temp = parseFloat(searchParams.get('temp') || '-28.4');
  const wind = parseFloat(searchParams.get('wind') || '18.2');
  const solar = parseFloat(searchParams.get('solar') || '240');

  // Pure physical calculations
  const airDensity = 1.293 * (273.15 / (273.15 + temp)); // kg/m^3
  const windKw = Math.min(60, 0.5 * airDensity * Math.PI * Math.pow(3.5, 2) * Math.pow(wind, 3) * 0.42 * 0.001);
  const solarPvKw = (solar * 0.08 * 1.38); // +38% albedo snow boost
  const baseDemandKw = 70 + Math.abs(temp) * 0.6;
  const dieselKw = Math.max(0, baseDemandKw - (windKw + solarPvKw));
  const thermalRecoveredKw = dieselKw * 0.78 + (Math.abs(temp) * 0.4);

  const response = {
    station,
    timestamp: new Date().toISOString(),
    ambient_temp_c: temp,
    wind_speed_ms: wind,
    air_density_kgm3: parseFloat(airDensity.toFixed(3)),
    solar_pv_kw: parseFloat(solarPvKw.toFixed(1)),
    wind_kw: parseFloat(windKw.toFixed(1)),
    diesel_dg1_kw: parseFloat(dieselKw.toFixed(1)),
    total_generation_kw: parseFloat((windKw + solarPvKw + dieselKw).toFixed(1)),
    total_load_kw: parseFloat(baseDemandKw.toFixed(1)),
    thermal_recovered_kw: parseFloat(thermalRecoveredKw.toFixed(1)),
    hydronic_supply_temp_c: 84.2,
    hydronic_return_temp_c: 63.8,
    lto_battery_kw: 12.0,
    lto_soc_pct: 86.4,
    fuel_reduction_pct: parseFloat((100 - (dieselKw / baseDemandKw) * 100).toFixed(1)),
    fsm_state: "COGEN_BALANCED"
  };

  return NextResponse.json(response);
}
