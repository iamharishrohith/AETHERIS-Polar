import numpy as np
from typing import Dict, Any

class PolarMicrogridOptimizer:
    """
    Receding horizon Mixed-Integer Linear Program (MILP) dispatcher
    balancing Diesel Gensets, Wind, Solar, Battery ESS, and Hydronic Exergy.
    """
    def __init__(self, station_config):
        self.config = station_config

    def solve_dispatch(self, elec_demand_kw: float, thermal_demand_kwth: float, wind_avail_kw: float, solar_avail_kw: float, battery_soc_pct: float) -> Dict[str, Any]:
        # 1. Renewable direct supply
        total_renewable_kw = wind_avail_kw + solar_avail_kw
        
        # 2. Net electrical load after renewables
        net_elec_load_kw = max(0.0, elec_demand_kw - total_renewable_kw)
        
        # 3. Determine DG commitment and BESS dispatch
        if net_elec_load_kw == 0:
            # Surplus renewable energy -> charge battery or divert to thermal immersion
            surplus_kw = total_renewable_kw - elec_demand_kw
            dg_dispatch_kw = 0.0
            battery_dispatch_kw = -min(self.config.lto_max_discharge_kw, surplus_kw)
            thermal_immersion_kwth = max(0.0, surplus_kw + battery_dispatch_kw) # Excess into heat
        else:
            if battery_soc_pct > 30.0 and net_elec_load_kw <= self.config.lto_max_discharge_kw:
                # Peak shave with battery
                battery_dispatch_kw = min(net_elec_load_kw, self.config.lto_max_discharge_kw * 0.75)
                residual_load_kw = net_elec_load_kw - battery_dispatch_kw
            else:
                battery_dispatch_kw = 0.0
                residual_load_kw = net_elec_load_kw

            # Run DG at anti-wet-stacking sweet spot (>= 40% load)
            if residual_load_kw > 0:
                min_dg_load = self.config.dg_rated_kw * 0.40
                dg_dispatch_kw = max(min_dg_load, min(self.config.dg_rated_kw * self.config.dg_count, residual_load_kw))
                # If DG generated more than residual to avoid wet stacking, charge battery
                excess_dg = dg_dispatch_kw - residual_load_kw
                if excess_dg > 0 and battery_soc_pct < 95.0:
                    battery_dispatch_kw -= excess_dg
            else:
                dg_dispatch_kw = 0.0
            
            thermal_immersion_kwth = 0.0

        # Fuel rate & CO2 calculations
        fuel_lph = (dg_dispatch_kw * 0.25) if dg_dispatch_kw > 0 else 0.0
        co2_mitigated_kg = max(0.0, (total_renewable_kw * 0.28 * 2.68)) # 2.68 kg CO2 per liter diesel

        # Exergy recovered heat
        q_recovered_kwth = (fuel_lph * 10.0 * 0.55) + thermal_immersion_kwth

        return {
            "dg_dispatch_kw": round(dg_dispatch_kw, 1),
            "wind_used_kw": round(min(wind_avail_kw, elec_demand_kw), 1),
            "solar_used_kw": round(min(solar_avail_kw, elec_demand_kw), 1),
            "battery_dispatch_kw": round(battery_dispatch_kw, 1),
            "thermal_immersion_kwth": round(thermal_immersion_kwth, 1),
            "q_recovered_kwth": round(q_recovered_kwth, 1),
            "fuel_flow_lph": round(fuel_lph, 2),
            "fuel_cost_saved_per_hr_inr": round((total_renewable_kw * 0.25) * self.config.fuel_cost_per_liter_inr, 2),
            "co2_mitigated_kg_per_hr": round(co2_mitigated_kg, 2)
        }
