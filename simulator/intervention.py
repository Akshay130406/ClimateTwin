import geopandas as gpd
import numpy as np
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent

GRID_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "pune_ml_dataset.geojson"
)


def load_intervention_data():
    if not GRID_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{GRID_FILE}"
        )

    return gpd.read_file(GRID_FILE)


def apply_intervention(
    gdf,
    tree_plantation=0,
    cool_roof=0,
    green_roof=0,
    urban_parks=0,
    reflective_roads=0,
    green_corridors=0,
):
    result = gdf.copy()

    # Original LST
    result["baseline_lst"] = result["hotseason_lst"]

    # ---------------------------------------
    # Normalize intervention values to 0–1
    # ---------------------------------------

    tree = np.clip(tree_plantation / 100, 0, 1)
    roof = np.clip(cool_roof / 100, 0, 1)
    green_roof_value = np.clip(green_roof / 100, 0, 1)
    parks = np.clip(urban_parks / 100, 0, 1)
    roads = np.clip(reflective_roads / 100, 0, 1)
    corridors = np.clip(green_corridors / 100, 0, 1)

    # ---------------------------------------
    # Estimated cooling effects
    #
    # Prototype assumptions:
    # Tree plantation      → up to 2.0°C
    # Cool roofs           → up to 1.2°C
    # Green roofs          → up to 1.0°C
    # Urban parks          → up to 1.5°C
    # Reflective roads     → up to 0.8°C
    # Green corridors      → up to 1.3°C
    # ---------------------------------------

    cooling_effect = (
        2.0 * tree
        + 1.2 * roof
        + 1.0 * green_roof_value
        + 1.5 * parks
        + 0.8 * roads
        + 1.3 * corridors
    )

    # ---------------------------------------
    # Stronger effect in hotter areas
    # ---------------------------------------

    heat_factor = (
        result["baseline_lst"] - result["baseline_lst"].min()
    ) / (
        result["baseline_lst"].max()
        - result["baseline_lst"].min()
    )

    heat_factor = heat_factor.fillna(0)

    # ---------------------------------------
    # Calculate intervention cooling
    # ---------------------------------------

    result["cooling_effect"] = (
        cooling_effect * (0.5 + 0.5 * heat_factor)
    )

    # ---------------------------------------
    # Simulated post-intervention LST
    # ---------------------------------------

    result["intervention_lst"] = (
        result["baseline_lst"]
        - result["cooling_effect"]
    )

    # ---------------------------------------
    # LST improvement
    # ---------------------------------------

    result["lst_reduction"] = (
        result["baseline_lst"]
        - result["intervention_lst"]
    )

    # ---------------------------------------
    # Risk classification
    # ---------------------------------------

    def classify(lst):
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

    result["baseline_risk"] = (
        result["baseline_lst"]
        .apply(classify)
    )

    result["intervention_risk"] = (
        result["intervention_lst"]
        .apply(classify)
    )

    return result


def calculate_intervention_summary(result):
    baseline = result["baseline_lst"]
    intervention = result["intervention_lst"]

    summary = {
        "baseline_average_lst": round(
            float(baseline.mean()), 2
        ),

        "intervention_average_lst": round(
            float(intervention.mean()), 2
        ),

        "average_lst_reduction": round(
            float(
                (baseline - intervention).mean()
            ),
            2,
        ),

        "baseline_high_risk_cells": int(
            (baseline >= 40).sum()
        ),

        "intervention_high_risk_cells": int(
            (intervention >= 40).sum()
        ),

        "baseline_very_high_risk_cells": int(
            (baseline >= 42).sum()
        ),

        "intervention_very_high_risk_cells": int(
            (intervention >= 42).sum()
        ),
    }

    return summary