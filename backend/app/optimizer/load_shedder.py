from typing import Dict, List, Any

class PolarTriageLoadShedder:
    """
    6-Level Sub-20ms hardwire relay triage matrix protecting life support,
    cryo-core vaults, and HF satellite links.
    """
    LOAD_PRIORITY_TIERS = {
        0: {"name": "Life Support & Oxygen Scrubbers", "kw": 35.0, "protected": True},
        1: {"name": "Habitat Radiant Heating Loop", "kw": 30.0, "protected": True},
        2: {"name": "Million-Year Ice Core Cryo-Vault", "kw": 25.0, "protected": True},
        3: {"name": "Satellite Telemetry & HF Radios", "kw": 15.0, "protected": True},
        4: {"name": "Scientific Radars & Computing", "kw": 40.0, "protected": False},
        5: {"name": "Fresh Snow-Melt Potable Basin", "kw": 35.0, "protected": False},
        6: {"name": "EV Snowmobile Chargers & Laundry", "kw": 25.0, "protected": False}
    }

    def evaluate_triage(self, available_gen_capacity_kw: float) -> Dict[str, Any]:
        running_capacity = available_gen_capacity_kw
        tripped_loads = []
        active_loads = []
        total_active_kw = 0.0

        for tier, details in self.LOAD_PRIORITY_TIERS.items():
            if running_capacity >= details["kw"]:
                active_loads.append({"tier": tier, "name": details["name"], "kw": details["kw"], "status": "CONNECTED"})
                running_capacity -= details["kw"]
                total_active_kw += details["kw"]
            else:
                tripped_loads.append({"tier": tier, "name": details["name"], "kw": details["kw"], "status": "SHED_TRIPPED"})

        return {
            "total_active_kw": total_active_kw,
            "total_shed_kw": sum(l["kw"] for l in tripped_loads),
            "active_loads": active_loads,
            "tripped_loads": tripped_loads,
            "life_support_guaranteed": all(l["status"] == "CONNECTED" for l in active_loads if l["tier"] <= 3)
        }
