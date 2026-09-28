from enum import IntEnum
from typing import Dict, Any

class PolarFSMState(IntEnum):
    ISLAND_DIESEL = 0
    COGEN_BALANCED = 1
    RENEWABLE_MAX = 2
    BESS_PEAK_SHAVE = 3
    BLIZZARD_ALERT = 4
    THERMAL_PRIORITY = 5
    LOAD_SHED_L1_L3 = 6
    BLACK_START = 7

STATE_DESCRIPTIONS = {
    PolarFSMState.ISLAND_DIESEL: "Standard baseline diesel gen with thermal jacket recovery.",
    PolarFSMState.COGEN_BALANCED: "Optimal 75-85% DG load with hydronic heat balance.",
    PolarFSMState.RENEWABLE_MAX: "Wind + Bifacial solar driving station; DGs at minimum load.",
    PolarFSMState.BESS_PEAK_SHAVE: "LTO Battery absorbing radar/pulsed science load surges.",
    PolarFSMState.BLIZZARD_ALERT: "Katabatic shock detected (dP/dt < -2.5 hPa). Thermal pre-heat active.",
    PolarFSMState.THERMAL_PRIORITY: "Severe freeze alert. Exhaust heat diverted to fresh water snow-melt.",
    PolarFSMState.LOAD_SHED_L1_L3: "Emergency triage: Non-critical laundry and science loads shed.",
    PolarFSMState.BLACK_START: "Grid collapse restoration protocol with autonomous LTO inverter boot."
}

class PolarFSM:
    def __init__(self, initial_state: PolarFSMState = PolarFSMState.COGEN_BALANCED):
        self.current_state = initial_state
        self.transition_history = []

    def evaluate_state(self, telemetry: Dict[str, Any]) -> PolarFSMState:
        # 1. Check for Katabatic Shock
        if telemetry.get("barometric_rate_of_change", 0) < -2.5:
            new_state = PolarFSMState.BLIZZARD_ALERT
        # 2. Check for Severe Thermal Deficit
        elif telemetry.get("habitat_temp_c", 20) < 14.0 or telemetry.get("ambient_temp_c", 0) < -38.0:
            new_state = PolarFSMState.THERMAL_PRIORITY
        # 3. Check for Grid Overload / Trip Risk
        elif telemetry.get("total_elec_load_kw", 0) > telemetry.get("total_gen_capacity_kw", 100):
            new_state = PolarFSMState.LOAD_SHED_L1_L3
        # 4. Check for High Renewable Surplus
        elif telemetry.get("renewable_generation_kw", 0) > telemetry.get("total_elec_load_kw", 0) * 0.6:
            new_state = PolarFSMState.RENEWABLE_MAX
        # 5. Check for Peak Shaving
        elif telemetry.get("transient_spike_detected", False):
            new_state = PolarFSMState.BESS_PEAK_SHAVE
        else:
            new_state = PolarFSMState.COGEN_BALANCED

        if new_state != self.current_state:
            self.transition_history.append({
                "from": self.current_state.name,
                "to": new_state.name,
                "timestamp": telemetry.get("timestamp")
            })
            self.current_state = new_state

        return self.current_state
