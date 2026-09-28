from typing import Dict, Any

class DualVectorExergyCalculator:
    """
    Computes electrical and thermal energy/exergy co-generation balance
    from Diesel Gensets (jacket water + exhaust) and Waste-Heat Recovery.
    """
    @staticmethod
    def compute_cogen(dg_electrical_output_kw: float, dg_rated_kw: float, ambient_temp_c: float) -> Dict[str, Any]:
        # Fuel consumption curve (Willans Line)
        load_ratio = max(0.0, min(1.0, dg_electrical_output_kw / max(1.0, dg_rated_kw)))
        
        # Specific Fuel Consumption in Liters per Hour
        # Baseline: 0.28 L/kWh at nominal load, climbs if under-loaded (wet-stacking)
        if load_ratio < 0.35:
            sfc = 0.38 # Heavy soot penalty
            wet_stacking_risk = True
        elif load_ratio <= 0.85:
            sfc = 0.25 # Optimal sweet spot
            wet_stacking_risk = False
        else:
            sfc = 0.29 # High load thermal stress
            wet_stacking_risk = False

        fuel_lph = dg_electrical_output_kw * sfc
        fuel_energy_in_kwth = fuel_lph * 10.0 # ~10 kWh per liter of arctic diesel

        # Heat recovery potentials
        # Jacket water recovery (~30% of fuel energy, 80°C flow)
        q_jacket_kwth = fuel_energy_in_kwth * 0.30 if dg_electrical_output_kw > 10 else 0.0
        # Exhaust gas recovery (~25% of fuel energy, via heat exchanger)
        q_exhaust_kwth = fuel_energy_in_kwth * 0.25 if dg_electrical_output_kw > 10 else 0.0
        
        total_recovered_heat_kwth = q_jacket_kwth + q_exhaust_kwth
        
        # Total combined exergy efficiency
        combined_efficiency_pct = ((dg_electrical_output_kw + total_recovered_heat_kwth * 0.45) / max(1.0, fuel_energy_in_kwth)) * 100.0

        return {
            "load_ratio_pct": round(load_ratio * 100.0, 1),
            "fuel_flow_lph": round(fuel_lph, 2),
            "sfc_l_per_kwh": round(sfc, 3),
            "wet_stacking_risk": wet_stacking_risk,
            "q_jacket_kwth": round(q_jacket_kwth, 1),
            "q_exhaust_kwth": round(q_exhaust_kwth, 1),
            "total_recovered_heat_kwth": round(total_recovered_heat_kwth, 1),
            "combined_efficiency_pct": round(min(92.0, combined_efficiency_pct), 1)
        }
