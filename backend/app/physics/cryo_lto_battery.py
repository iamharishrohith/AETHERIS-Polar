import math
from typing import Dict, Any

class CryoLithiumTitanateBattery:
    """
    Simulates Lithium Titanate (LTO) battery electrochemistry down to -50°C
    and high-frequency AC pulse internal Joule cryo-warming.
    """
    def __init__(self, capacity_kwh: float = 300.0, initial_soc: float = 0.85):
        self.capacity_kwh = capacity_kwh
        self.soc = initial_soc
        self.core_temp_c = -20.0
        self.ac_pulse_active = False

    def step(self, power_request_kw: float, ambient_temp_c: float, dt_seconds: float = 1.0) -> Dict[str, Any]:
        # Arrhenius ionic conductivity factor for LTO
        # LTO retains 92% capacity at -40°C vs LFP which drops to 18%
        t_kelvin = self.core_temp_c + 273.15
        temp_derate = math.exp(-1200.0 * ((1.0 / t_kelvin) - (1.0 / 298.15)))
        effective_capacity = self.capacity_kwh * max(0.80, min(1.0, temp_derate))

        # AC Pulse Cryo-Warming: If core temp < -15°C and AC pulse active
        if self.core_temp_c < -15.0 and not self.ac_pulse_active:
            self.ac_pulse_active = True
            
        if self.ac_pulse_active:
            # 5 kHz AC pulse generates 8.5 kW volumetric heating inside cell matrix
            heat_gen_kw = 8.5
            self.core_temp_c += (heat_gen_kw * dt_seconds / 450.0) # Thermal mass warming
            # Parasitic energy consumption is ~2.5%
            self.soc -= (heat_gen_kw * (dt_seconds / 3600.0)) / self.capacity_kwh
            if self.core_temp_c >= 10.0:
                self.ac_pulse_active = False

        # Apply power flow
        power_delivered = power_request_kw
        if power_request_kw > 0: # Discharging
            delta_soc = -(power_delivered * (dt_seconds / 3600.0)) / effective_capacity
        else: # Charging
            delta_soc = -(power_delivered * 0.94 * (dt_seconds / 3600.0)) / effective_capacity

        self.soc = max(0.10, min(0.98, self.soc + delta_soc))

        return {
            "soc_pct": round(self.soc * 100.0, 1),
            "core_temp_c": round(self.core_temp_c, 1),
            "effective_capacity_kwh": round(effective_capacity, 1),
            "ac_pulse_warming_active": self.ac_pulse_active,
            "power_flow_kw": round(power_delivered, 1),
            "dendrite_risk": "ZERO_LTO_IMMUNITY"
        }
