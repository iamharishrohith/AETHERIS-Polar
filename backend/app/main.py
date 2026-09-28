import asyncio
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

from core.config import STATION_PRESETS, PolarStationConfig
from core.state_machine import PolarFSM, PolarFSMState, STATE_DESCRIPTIONS
from core.security_ledger import PolarSecurityLedger
from physics.katabatic_engine import KatabaticShockPredictor
from physics.exergy_thermal import DualVectorExergyCalculator
from physics.cryo_lto_battery import CryoLithiumTitanateBattery
from physics.wind_polar_density import PolarWindAerodynamics
from physics.bifacial_solar import PolarBifacialSolarModel
from optimizer.milp_dispatcher import PolarMicrogridOptimizer
from optimizer.load_shedder import PolarTriageLoadShedder

app = FastAPI(title="AETHERIS-POLAR Backend Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_station_code = "BHARATI"
config = STATION_PRESETS[current_station_code]
fsm = PolarFSM()
ledger = PolarSecurityLedger()
katabatic = KatabaticShockPredictor()
battery = CryoLithiumTitanateBattery(capacity_kwh=config.lto_capacity_kwh)
optimizer = PolarMicrogridOptimizer(config)
triage = PolarTriageLoadShedder()

connected_clients: List[WebSocket] = []

@app.get("/api/status")
def get_status():
    return {
        "station": config.name,
        "code": config.code,
        "fsm_state": fsm.current_state.name,
        "fsm_state_code": int(fsm.current_state),
        "fsm_description": STATE_DESCRIPTIONS[fsm.current_state],
        "air_gapped_security": "BSA 2023 §65B IMMUTABLE WAL",
        "ledger_integrity": ledger.verify_ledger_integrity()
    }

@app.get("/api/stations")
def get_stations():
    return list(STATION_PRESETS.keys())

@app.post("/api/station/{code}")
def set_station(code: str):
    global current_station_code, config, battery, optimizer
    if code in STATION_PRESETS:
        current_station_code = code
        config = STATION_PRESETS[code]
        battery = CryoLithiumTitanateBattery(capacity_kwh=config.lto_capacity_kwh)
        optimizer = PolarMicrogridOptimizer(config)
        return {"status": "SUCCESS", "station": config.name}
    return {"status": "ERROR", "message": "Station not found"}

@app.get("/api/ledger/blocks")
def get_ledger_blocks():
    import sqlite3
    with sqlite3.connect("aetheris_polar_ledger.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT block_index, iso_time, station_code, fsm_state, fuel_flow_lph, co2_mitigated_kg, exergy_efficiency_pct, prev_hash, current_hash FROM polar_audit_ledger ORDER BY block_index DESC LIMIT 15")
        rows = cursor.fetchall()
        return [
            {
                "block_index": r[0],
                "iso_time": r[1],
                "station_code": r[2],
                "fsm_state": r[3],
                "fuel_flow_lph": r[4],
                "co2_mitigated_kg": r[5],
                "exergy_efficiency_pct": r[6],
                "prev_hash": r[7],
                "current_hash": r[8]
            } for r in rows
        ]

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    sim_time = 0.0
    
    try:
        while True:
            sim_time += 1.0
            # Generate realistic Antarctic simulated telemetry
            # Ambient temp swings, Katabatic wind surges, Solar 24h day
            amb_temp = -28.0 + 5.0 * np.sin(sim_time / 120.0)
            pressure = 985.0 - 4.0 * np.sin(sim_time / 60.0)
            wind_speed = 12.5 + 8.0 * np.sin(sim_time / 45.0)
            ghi = max(0.0, 450.0 + 350.0 * np.cos(sim_time / 100.0))
            solar_elev = 18.0 + 12.0 * np.cos(sim_time / 100.0)
            base_elec_load = 145.0 + 35.0 * np.sin(sim_time / 30.0)
            thermal_load = 160.0 + 20.0 * np.cos(sim_time / 40.0)

            # 1. Physics: Katabatic
            kata_out = katabatic.update(pressure, time.time())

            # 2. Physics: Wind & Solar
            wind_out = PolarWindAerodynamics.calculate_power(wind_speed, amb_temp, pressure, config.wind_rated_kw, config.wind_turbine_count)
            solar_out = PolarBifacialSolarModel.calculate_yield(ghi, solar_elev, config.solar_bifacial_kwp)

            # 3. Battery State
            bat_out = battery.step(power_request_kw=10.0 * np.sin(sim_time / 20.0), ambient_temp_c=amb_temp, dt_seconds=1.0)

            # 4. Optimization Dispatch
            dispatch = optimizer.solve_dispatch(
                elec_demand_kw=base_elec_load,
                thermal_demand_kwth=thermal_load,
                wind_avail_kw=wind_out["total_wind_generation_kw"],
                solar_avail_kw=solar_out["solar_generation_kw"],
                battery_soc_pct=bat_out["soc_pct"]
            )

            # 5. Cogen Exergy
            cogen = DualVectorExergyCalculator.compute_cogen(dispatch["dg_dispatch_kw"], config.dg_rated_kw * config.dg_count, amb_temp)

            # 6. FSM State Evaluation
            telemetry_snapshot = {
                "barometric_rate_of_change": kata_out["dp_dt_hpa_per_30min"],
                "habitat_temp_c": 21.2 + 0.4 * np.sin(sim_time / 50.0),
                "ambient_temp_c": amb_temp,
                "total_elec_load_kw": base_elec_load,
                "total_gen_capacity_kw": config.dg_rated_kw * config.dg_count,
                "renewable_generation_kw": wind_out["total_wind_generation_kw"] + solar_out["solar_generation_kw"],
                "transient_spike_detected": False,
                "timestamp": time.time()
            }
            current_fsm = fsm.evaluate_state(telemetry_snapshot)

            # 7. Triage Load Shedder
            triage_out = triage.evaluate_triage(dispatch["dg_dispatch_kw"] + wind_out["total_wind_generation_kw"] + solar_out["solar_generation_kw"])

            # 8. Record in Cryptographic Ledger periodically
            if int(sim_time) % 10 == 0:
                ledger.record_event(
                    station_code=config.code,
                    fsm_state=current_fsm.name,
                    fuel_flow_lph=cogen["fuel_flow_lph"],
                    co2_mitigated_kg=dispatch["co2_mitigated_kg_per_hr"],
                    exergy_efficiency_pct=cogen["combined_efficiency_pct"],
                    payload={"dg_kw": dispatch["dg_dispatch_kw"], "wind_kw": wind_out["total_wind_generation_kw"], "solar_kw": solar_out["solar_generation_kw"]}
                )

            payload = {
                "timestamp": time.time(),
                "station": config.name,
                "code": config.code,
                "fsm": {
                    "code": int(current_fsm),
                    "name": current_fsm.name,
                    "description": STATE_DESCRIPTIONS[current_fsm]
                },
                "environment": {
                    "ambient_temp_c": round(amb_temp, 1),
                    "pressure_hpa": round(pressure, 1),
                    "wind_speed_ms": round(wind_speed, 1),
                    "air_density_kg_m3": wind_out["air_density_kg_m3"],
                    "density_boost_pct": wind_out["density_boost_pct"],
                    "katabatic_status": kata_out
                },
                "generation": {
                    "dg_kw": dispatch["dg_dispatch_kw"],
                    "wind_kw": wind_out["total_wind_generation_kw"],
                    "solar_kw": solar_out["solar_generation_kw"],
                    "albedo_boost_kw": solar_out["snow_albedo_boost_kw"],
                    "battery_flow_kw": bat_out["power_flow_kw"],
                    "battery_soc_pct": bat_out["soc_pct"],
                    "battery_core_temp_c": bat_out["core_temp_c"],
                    "ac_pulse_active": bat_out["ac_pulse_warming_active"]
                },
                "thermal_exergy": {
                    "cogen_recovered_kwth": cogen["total_recovered_heat_kwth"],
                    "q_jacket_kwth": cogen["q_jacket_kwth"],
                    "q_exhaust_kwth": cogen["q_exhaust_kwth"],
                    "immersion_sink_kwth": dispatch["thermal_immersion_kwth"],
                    "fuel_flow_lph": cogen["fuel_flow_lph"],
                    "sfc_l_per_kwh": cogen["sfc_l_per_kwh"],
                    "combined_efficiency_pct": cogen["combined_efficiency_pct"],
                    "wet_stacking_risk": cogen["wet_stacking_risk"]
                },
                "triage_shedding": triage_out,
                "savings": {
                    "cost_saved_per_hr_inr": dispatch["fuel_cost_saved_per_hr_inr"],
                    "co2_mitigated_kg_per_hr": dispatch["co2_mitigated_kg_per_hr"]
                }
            }

            await websocket.send_json(payload)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
    except Exception as e:
        if websocket in connected_clients:
            connected_clients.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    import numpy as np
    uvicorn.run(app, host="0.0.0.0", port=8000)
