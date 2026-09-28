import numpy as np
from typing import List, Dict, Any

class KatabaticShockPredictor:
    """
    Detects sudden barometric pressure gradients (dP/dt) that signal
    incoming Antarctic katabatic squalls before wind turbines hit 25m/s cutout.
    """
    def __init__(self, history_len: int = 30):
        self.history_len = history_len
        self.pressure_history: List[float] = []
        self.timestamps: List[float] = []

    def update(self, current_pressure_hpa: float, timestamp: float) -> Dict[str, Any]:
        self.pressure_history.append(current_pressure_hpa)
        self.timestamps.append(timestamp)
        if len(self.pressure_history) > self.history_len:
            self.pressure_history.pop(0)
            self.timestamps.pop(0)

        if len(self.pressure_history) < 2:
            return {
                "dp_dt_hpa_per_30min": 0.0,
                "katabatic_warning_level": "NORMAL",
                "pre_heat_command_active": False,
                "seconds_to_storm_front": 3600
            }

        # Compute gradient over last window
        dt_mins = (self.timestamps[-1] - self.timestamps[0]) / 60.0
        if dt_mins > 0:
            dp_dt = ((self.pressure_history[-1] - self.pressure_history[0]) / dt_mins) * 30.0
        else:
            dp_dt = 0.0

        # Warning thresholds: < -2.5 hPa in 30min is katabatic onset
        if dp_dt < -3.5:
            warning = "CRITICAL_KATABATIC_SQUALL"
            pre_heat = True
            time_to_storm = 300 # 5 mins
        elif dp_dt < -2.0:
            warning = "WARNING_PRESSURE_SURGE"
            pre_heat = True
            time_to_storm = 900 # 15 mins
        else:
            warning = "NORMAL"
            pre_heat = False
            time_to_storm = 3600

        return {
            "dp_dt_hpa_per_30min": round(dp_dt, 3),
            "katabatic_warning_level": warning,
            "pre_heat_command_active": pre_heat,
            "seconds_to_storm_front": time_to_storm
        }
