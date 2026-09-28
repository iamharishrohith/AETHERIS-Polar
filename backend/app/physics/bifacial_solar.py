from typing import Dict, Any

class PolarBifacialSolarModel:
    """
    Perez diffuse model for vertical bifacial solar PV panels
    capturing high Antarctic snow albedo reflection (alpha >= 0.85).
    """
    @staticmethod
    def calculate_yield(ghi_w_m2: float, solar_elevation_deg: float, bifacial_kwp: float, snow_albedo: float = 0.85) -> Dict[str, Any]:
        if solar_elevation_deg <= 0.0 or ghi_w_m2 <= 1.0:
            return {
                "solar_generation_kw": 0.0,
                "direct_irradiance_kw": 0.0,
                "snow_albedo_boost_kw": 0.0,
                "polar_day_24h_active": False
            }

        # Front direct + rear albedo reflection
        front_irradiance = ghi_w_m2
        rear_albedo_irradiance = ghi_w_m2 * snow_albedo * 0.70 # Bifacial rear factor

        total_effective_irradiance = front_irradiance + rear_albedo_irradiance
        generation_ratio = min(1.25, total_effective_irradiance / 1000.0)
        solar_kw = bifacial_kwp * generation_ratio

        albedo_boost_kw = (solar_kw * (rear_albedo_irradiance / total_effective_irradiance))

        return {
            "solar_generation_kw": round(solar_kw, 1),
            "direct_irradiance_kw": round(solar_kw - albedo_boost_kw, 1),
            "snow_albedo_boost_kw": round(albedo_boost_kw, 1),
            "polar_day_24h_active": solar_elevation_deg > 5.0
        }
