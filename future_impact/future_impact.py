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


def load_future_impact_data():
    """
    Load the current ClimateTwin city grid.
    """

    if not GRID_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{GRID_FILE}"
        )

    gdf = gpd.read_file(GRID_FILE)

    required_columns = [
        "cell_id",
        "hotseason_lst",
        "population",
        "population_density",
        "ndvi",
        "building_density",
        "water_coverage",
        "geometry",
    ]

    missing = [
        column
        for column in required_columns
        if column not in gdf.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )

    return gdf


def normalize(series):
    """
    Normalize values between 0 and 1.
    """

    minimum = series.min()
    maximum = series.max()

    if maximum == minimum:
        return series * 0

    return (series - minimum) / (
        maximum - minimum
    )


def calculate_future_scenario(
    gdf,
    years_ahead,
    temperature_increase,
    population_growth,
    urbanization_increase,
    vegetation_change,
):
    """
    Simulate a future climate scenario.

    Parameters are scenario assumptions, not forecasts.
    """

    result = gdf.copy()

    # --------------------------------------------------
    # Population projection
    # --------------------------------------------------

    population_factor = (
        1 + population_growth / 100
    ) ** (years_ahead / 10)

    result["future_population"] = (
        result["population"] * population_factor
    )

    result["future_population_density"] = (
        result["population_density"]
        * population_factor
    )

    # --------------------------------------------------
    # Urbanization projection
    # --------------------------------------------------

    urbanization_factor = (
        1 + urbanization_increase / 100
    ) ** (years_ahead / 10)

    result["future_building_density"] = (
        result["building_density"]
        * urbanization_factor
    )

    # --------------------------------------------------
    # Vegetation projection
    # --------------------------------------------------

    vegetation_factor = (
        1 - vegetation_change / 100
    ) ** (years_ahead / 10)

    result["future_ndvi"] = (
        result["ndvi"] * vegetation_factor
    ).clip(0, 1)

    # --------------------------------------------------
    # Temperature projection
    # --------------------------------------------------

    result["future_lst"] = (
        result["hotseason_lst"]
        + temperature_increase
    )

    # --------------------------------------------------
    # Future heat exposure
    # --------------------------------------------------

    heat_score = normalize(
        result["future_lst"]
    )

    population_score = normalize(
        result["future_population_density"]
    )

    building_score = normalize(
        result["future_building_density"]
    )

    vegetation_score = (
        1 - normalize(result["future_ndvi"])
    )

    water_score = (
        1 - normalize(result["water_coverage"])
    )

    # --------------------------------------------------
    # Future priority score
    # --------------------------------------------------

    result["future_priority_score"] = (
        0.35 * heat_score
        + 0.30 * population_score
        + 0.15 * vegetation_score
        + 0.10 * building_score
        + 0.10 * water_score
    ) * 100

    result["future_priority_score"] = (
        result["future_priority_score"]
        .round(2)
        .clip(0, 100)
    )

    # --------------------------------------------------
    # Risk classification
    # --------------------------------------------------

    def classify_risk(lst):

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

    result["future_risk_level"] = (
        result["future_lst"]
        .apply(classify_risk)
    )

    return result


def calculate_future_summary(
    baseline,
    future,
):
    """
    Generate city-level comparison statistics.
    """

    baseline_average = float(
        baseline["hotseason_lst"].mean()
    )

    future_average = float(
        future["future_lst"].mean()
    )

    baseline_population = float(
        baseline["population"].sum()
    )

    future_population = float(
        future["future_population"].sum()
    )

    baseline_high_risk = int(
        (baseline["hotseason_lst"] >= 40).sum()
    )

    future_high_risk = int(
        (future["future_lst"] >= 40).sum()
    )

    baseline_very_high_risk = int(
        (baseline["hotseason_lst"] >= 42).sum()
    )

    future_very_high_risk = int(
        (future["future_lst"] >= 42).sum()
    )

    return {
        "baseline_average_lst": round(
            baseline_average,
            2,
        ),

        "future_average_lst": round(
            future_average,
            2,
        ),

        "temperature_change": round(
            future_average - baseline_average,
            2,
        ),

        "baseline_population": round(
            baseline_population,
            0,
        ),

        "future_population": round(
            future_population,
            0,
        ),

        "population_change_percent": round(
            (
                (
                    future_population
                    - baseline_population
                )
                / baseline_population
            )
            * 100,
            2,
        ),

        "baseline_high_risk_cells": (
            baseline_high_risk
        ),

        "future_high_risk_cells": (
            future_high_risk
        ),

        "change_in_high_risk_cells": (
            future_high_risk
            - baseline_high_risk
        ),

        "baseline_very_high_risk_cells": (
            baseline_very_high_risk
        ),

        "future_very_high_risk_cells": (
            future_very_high_risk
        ),

        "change_in_very_high_risk_cells": (
            future_very_high_risk
            - baseline_very_high_risk
        ),

        "highest_priority_score": round(
            float(
                future[
                    "future_priority_score"
                ].max()
            ),
            2,
        ),

        "average_future_priority_score": round(
            float(
                future[
                    "future_priority_score"
                ].mean()
            ),
            2,
        ),
    }


if __name__ == "__main__":

    gdf = load_future_impact_data()

    future = calculate_future_scenario(
        gdf=gdf,
        years_ahead=20,
        temperature_increase=2.0,
        population_growth=8.0,
        urbanization_increase=5.0,
        vegetation_change=5.0,
    )

    summary = calculate_future_summary(
        baseline=gdf,
        future=future,
    )

    print()
    print("ClimateTwin Future Impact Engine")
    print("=" * 50)

    print(
        f"Baseline Average LST: "
        f"{summary['baseline_average_lst']} °C"
    )

    print(
        f"Future Average LST: "
        f"{summary['future_average_lst']} °C"
    )

    print(
        f"Temperature Change: "
        f"{summary['temperature_change']} °C"
    )

    print(
        f"Baseline Population: "
        f"{summary['baseline_population']:,.0f}"
    )

    print(
        f"Future Population: "
        f"{summary['future_population']:,.0f}"
    )

    print(
        f"Population Change: "
        f"{summary['population_change_percent']}%"
    )

    print(
        f"Baseline High-Risk Cells: "
        f"{summary['baseline_high_risk_cells']}"
    )

    print(
        f"Future High-Risk Cells: "
        f"{summary['future_high_risk_cells']}"
    )

    print(
        f"Future Priority Score: "
        f"{summary['average_future_priority_score']}/100"
    )