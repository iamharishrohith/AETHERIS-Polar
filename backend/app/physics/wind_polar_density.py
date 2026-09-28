import math
from typing import Dict, Any

class PolarWindAerodynamics:
    """
    Computes wind power with sub-zero atmospheric density surge (rho=1.45 kg/m3 at -40C)
    and aerodynamic rime ice accretion derating.
    """
    @staticmethod
    def calculate_power(wind_speed_ms: float, ambient_temp_c: float, pressure_hpa: float, rated_kw: float, turbine_count: int = 4) -> Dict[str, Any]:
        # Sub-zero air density: rho = P / (R_spec * T)
        t_kelvin = ambient_temp_c + 273.15
        p_pascals = pressure_hpa * 100.0
        rho_air = p_pascals / (287.058 * t_kelvin) # ~1.45 kg/m3 at -40°C vs 1.225 standard

        # Cut-in: 3.5 m/s, Rated: 12 m/s, Cut-out: 25 m/s
        if wind_speed_ms < 3.5 or wind_speed_ms >= 25.0:
            mech_power_single = 0.0
            feathered = wind_speed_ms >= 25.0
        elif wind_speed_ms < 12.0:
            # Power scales with rho * v^3
            power_ratio = (wind_speed_ms / 12.0) ** 3
            density_boost = rho_air / 1.225
            mech_power_single = rated_kw * power_ratio * density_boost
            feathered = False
        else:
            mech_power_single = rated_kw * (rho_air / 1.225)
            feathered = False

        total_wind_kw = min(rated_kw * turbine_count * 1.15, mech_power_single * turbine_count)

        return {
            "air_density_kg_m3": round(rho_air, 3),
            "density_boost_pct": round((rho_air / 1.225 - 1.0) * 100.0, 1),
            "total_wind_generation_kw": round(total_wind_kw, 1),
            "turbines_feathered": feathered,
            "rime_ice_loss_kw": round(total_wind_kw * 0.08 if ambient_temp_c < -15 else 0.0, 1)
        }
