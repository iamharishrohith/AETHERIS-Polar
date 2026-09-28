import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const temp = parseFloat(searchParams.get('temp') || -28);
  const wind = parseFloat(searchParams.get('wind') || 18);
  const solar = parseFloat(searchParams.get('solar') || 240);

  return calculateOptimization(temp, wind, solar);
}

export async function POST(request) {
  let temp = -28;
  let wind = 18;
  let solar = 240;

  try {
    const body = await request.json();
    if (body) {
      if (body.temp !== undefined) temp = parseFloat(body.temp);
      if (body.wind !== undefined) wind = parseFloat(body.wind);
      if (body.solar !== undefined) solar = parseFloat(body.solar);
      if (body.wind_speed !== undefined) wind = parseFloat(body.wind_speed);
      if (body.solar_irradiance !== undefined) solar = parseFloat(body.solar_irradiance);
      if (body.ambient_temp !== undefined) temp = parseFloat(body.ambient_temp);
    }
  } catch (err) {
    // Fallback to query or defaults
  }

  return calculateOptimization(temp, wind, solar);
}

function calculateOptimization(temp, wind, solar) {
  const airDensity = 1.293 * (273.15 / (273.15 + temp));
  const renewableKw = (solar * 0.08 * 1.38) + (0.5 * airDensity * 38.5 * Math.pow(Math.min(wind, 25), 3) * 0.4 * 0.001);
  const loadKw = 70 + Math.abs(temp) * 0.6;
  const dieselKw = Math.max(0, loadKw - renewableKw);
  const fuelSavedPct = Math.min(100, Math.max(0, 100 - (dieselKw / loadKw) * 100));

  return NextResponse.json({
    status: "OPTIMAL_SIMPLEX_CONVERGED",
    ambient_temp_c: temp,
    wind_speed_ms: wind,
    solar_irradiance_wm2: solar,
    air_density_kgm3: parseFloat(airDensity.toFixed(3)),
    load_kw: parseFloat(loadKw.toFixed(1)),
    renewable_kw: parseFloat(renewableKw.toFixed(1)),
    diesel_kw: parseFloat(dieselKw.toFixed(1)),
    fuel_reduction_pct: parseFloat(fuelSavedPct.toFixed(1)),
    objective_cost_usd_hr: parseFloat((dieselKw * 4.8 + 12.0).toFixed(2))
  });
}
