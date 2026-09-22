from fastapi import APIRouter
from pydantic import BaseModel

from simulator.intervention import (
    load_intervention_data,
    apply_intervention,
    calculate_intervention_summary,
)

router = APIRouter()


class InterventionRequest(BaseModel):
    tree_plantation: float = 0
    cool_roof: float = 0
    green_roof: float = 0
    urban_parks: float = 0
    reflective_roads: float = 0
    green_corridors: float = 0


@router.post("/intervention")
def run_intervention(request: InterventionRequest):

    gdf = load_intervention_data()

    result = apply_intervention(
        gdf,
        tree_plantation=request.tree_plantation,
        cool_roof=request.cool_roof,
        green_roof=request.green_roof,
        urban_parks=request.urban_parks,
        reflective_roads=request.reflective_roads,
        green_corridors=request.green_corridors,
    )

    summary = calculate_intervention_summary(result)

    cells = result[
        [
            "cell_id",
            "baseline_lst",
            "intervention_lst",
            "lst_reduction",
            "baseline_risk",
            "intervention_risk",
            "ndvi",
            "population_density",
            "building_density",
            "water_coverage",
            "geometry",
        ]
    ].copy()

    cells_geojson = cells.to_json()

    return {
        "intervention_parameters": request.model_dump(),
        "summary": summary,
        "cells": cells_geojson,
    }