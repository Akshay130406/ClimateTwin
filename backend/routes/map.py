from fastapi import APIRouter
import geopandas as gpd
import pandas as pd
import joblib

router = APIRouter()

GRID_FILE = "data/processed/pune_ml_dataset.geojson"
MODEL_FILE = "ml/models/heat_lst_random_forest.joblib"

FEATURES = [
    "ndvi",
    "population_density",
    "building_density",
    "building_count",
    "road_density",
    "road_count",
    "water_coverage",
]


@router.get("/map/cells")
def get_map_cells():
    gdf = gpd.read_file(GRID_FILE)

    columns = [
        "cell_id",
        "hotseason_lst",
        "ndvi",
        "population_density",
        "building_density",
        "road_density",
        "water_coverage",
        "geometry"
    ]

    gdf = gdf[columns].copy()

    return gdf.to_json()


@router.get("/dashboard/stats")
def get_dashboard_stats():
    gdf = gpd.read_file(GRID_FILE)

    lst = gdf["hotseason_lst"]

    stats = {
        "total_cells": int(len(gdf)),
        "average_lst": round(float(lst.mean()), 2),
        "max_lst": round(float(lst.max()), 2),
        "min_lst": round(float(lst.min()), 2),
        "high_risk_cells": int((lst >= 40).sum()),
        "very_high_risk_cells": int((lst >= 42).sum()),
        "average_ndvi": round(float(gdf["ndvi"].mean()), 3),
        "average_population_density": round(
            float(gdf["population_density"].mean()), 2
        )
    }

    return stats


@router.get("/heat-risk")
def get_heat_risk():
    gdf = gpd.read_file(GRID_FILE)

    model = joblib.load(MODEL_FILE)

    X = gdf[FEATURES].copy()

    predictions = model.predict(X)

    gdf["predicted_lst"] = predictions

    def get_risk_level(lst):
        if lst >= 42:
            return "Very High"
        elif lst >= 40:
            return "High"
        elif lst >= 38:
            return "Moderate"
        elif lst >= 36:
            return "Low"
        else:
            return "Very Low"

    gdf["risk_level"] = gdf["predicted_lst"].apply(get_risk_level)

    result = gdf[
        [
            "cell_id",
            "predicted_lst",
            "risk_level",
            "hotseason_lst",
            "ndvi",
            "population_density",
            "building_density",
            "road_density",
            "water_coverage"
        ]
    ].copy()

    return result.to_dict(orient="records")