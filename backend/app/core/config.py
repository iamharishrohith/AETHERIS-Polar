from pydantic import BaseModel
from typing import Dict

class PolarStationConfig(BaseModel):
    name: str
    code: str
    latitude: float
    longitude: float
    altitude_m: float
    ambient_temp_min: float
    ambient_temp_max: float
    dg_rated_kw: float
    dg_count: int
    wind_rated_kw: float
    wind_turbine_count: int
    solar_bifacial_kwp: float
    lto_capacity_kwh: float
    lto_max_discharge_kw: float
    fuel_cost_per_liter_inr: float = 380.0
    heating_demand_design_kwth: float
    critical_life_support_kw: float

STATION_PRESETS: Dict[str, PolarStationConfig] = {
    "BHARATI": PolarStationConfig(
        name="Bharati Station (Larsemann Hills)",
        code="BHARATI",
        latitude=-69.4072,
        longitude=76.1914,
        altitude_m=35.0,
        ambient_temp_min=-40.0,
        ambient_temp_max=5.0,
        dg_rated_kw=200.0,
        dg_count=3,
        wind_rated_kw=25.0,
        wind_turbine_count=4,
        solar_bifacial_kwp=80.0,
        lto_capacity_kwh=300.0,
        lto_max_discharge_kw=150.0,
        fuel_cost_per_liter_inr=380.0,
        heating_demand_design_kwth=180.0,
        critical_life_support_kw=65.0
    ),
    "MAITRI": PolarStationConfig(
        name="Maitri Station (Schirmacher Oasis)",
        code="MAITRI",
        latitude=-70.7667,
        longitude=11.7333,
        altitude_m=117.0,
        ambient_temp_min=-50.0,
        ambient_temp_max=2.0,
        dg_rated_kw=160.0,
        dg_count=3,
        wind_rated_kw=20.0,
        wind_turbine_count=3,
        solar_bifacial_kwp=50.0,
        lto_capacity_kwh=220.0,
        lto_max_discharge_kw=110.0,
        fuel_cost_per_liter_inr=420.0,
        heating_demand_design_kwth=160.0,
        critical_life_support_kw=55.0
    ),
    "HIMADRI": PolarStationConfig(
        name="Himadri Station (Ny-Ålesund, Arctic)",
        code="HIMADRI",
        latitude=78.9236,
        longitude=11.9281,
        altitude_m=15.0,
        ambient_temp_min=-35.0,
        ambient_temp_max=8.0,
        dg_rated_kw=100.0,
        dg_count=2,
        wind_rated_kw=15.0,
        wind_turbine_count=2,
        solar_bifacial_kwp=30.0,
        lto_capacity_kwh=120.0,
        lto_max_discharge_kw=60.0,
        fuel_cost_per_liter_inr=310.0,
        heating_demand_design_kwth=80.0,
        critical_life_support_kw=30.0
    )
}
