from fastapi import APIRouter
from pydantic import BaseModel

from simulator.climate_scenario import (
    load_baseline_data,
    apply_scenario,
    calculate_summary,
)

router = APIRouter()


class ScenarioRequest(BaseModel):
    temperature_increase: float = 0.0
    vegetation_decrease: float = 0.0
    rainfall_change: float = 0.0
    urbanization_increase: float = 0.0
    population_growth: float = 0.0
    water_availability_change: float = 0.0


@router.post("/simulate")
def simulate_climate_scenario(
    request: ScenarioRequest,
):
    baseline = load_baseline_data()

    scenario = apply_scenario(
        baseline,
        temperature_increase=request.temperature_increase,
        vegetation_decrease=request.vegetation_decrease,
        rainfall_change=request.rainfall_change,
        urbanization_increase=request.urbanization_increase,
        population_growth=request.population_growth,
        water_availability_change=request.water_availability_change,
    )

    summary = calculate_summary(
        baseline,
        scenario,
    )

    # Prepare per-cell scenario results
    cells = scenario[
        [
            "cell_id",
            "scenario_lst",
            "risk_level",
            "hotseason_lst",
            "ndvi",
            "population_density",
            "building_density",
            "road_density",
            "water_coverage",
            "population",
            "geometry",
        ]
    ].copy()

    # Convert spatial cells to GeoJSON
    cells_geojson = cells.to_json()

    return {
        "scenario_parameters": request.model_dump(),
        "summary": summary,
        "cells": cells_geojson,
    }