from fastapi import APIRouter
from pydantic import BaseModel

from future_impact.future_impact import (
    load_future_impact_data,
    calculate_future_scenario,
    calculate_future_summary,
)


router = APIRouter()


class FutureImpactRequest(BaseModel):
    years_ahead: int = 20
    temperature_increase: float = 2.0
    population_growth: float = 8.0
    urbanization_increase: float = 5.0
    vegetation_change: float = 5.0


@router.post("/future-impact")
def run_future_impact(request: FutureImpactRequest):

    baseline = load_future_impact_data()

    future = calculate_future_scenario(
        gdf=baseline,
        years_ahead=request.years_ahead,
        temperature_increase=request.temperature_increase,
        population_growth=request.population_growth,
        urbanization_increase=request.urbanization_increase,
        vegetation_change=request.vegetation_change,
    )

    summary = calculate_future_summary(
        baseline=baseline,
        future=future,
    )

    cells = future[
        [
            "cell_id",
            "future_lst",
            "future_risk_level",
            "future_priority_score",
            "hotseason_lst",
            "future_population_density",
            "future_ndvi",
            "future_building_density",
            "water_coverage",
            "geometry",
        ]
    ].copy()

    return {
        "scenario_parameters": request.model_dump(),
        "summary": summary,
        "cells": cells.to_json(),
    }