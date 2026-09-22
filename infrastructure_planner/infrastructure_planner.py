from pathlib import Path
import geopandas as gpd
import pandas as pd


# =========================================================
# PROJECT PATHS
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATASET_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "pune_ml_dataset.geojson"
)


# =========================================================
# LOAD DATASET
# =========================================================

def load_dataset():

    gdf = gpd.read_file(DATASET_FILE)

    required_columns = [
        "cell_id",
        "hotseason_lst",
        "ndvi",
        "population_density",
        "building_density",
        "water_coverage",
        "road_density",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in gdf.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    return gdf


# =========================================================
# NORMALIZATION
# =========================================================

def normalize(series):

    minimum = series.min()
    maximum = series.max()

    if maximum == minimum:
        return pd.Series(
            0.0,
            index=series.index
        )

    return (
        (series - minimum)
        / (maximum - minimum)
    )


# =========================================================
# CONSTRUCTION SCORING ENGINE
# =========================================================

def calculate_construction_score(
    gdf,
    project_type="Highway"
):

    data = gdf.copy()

    # -----------------------------------------------------
    # NORMALIZED FACTORS
    # -----------------------------------------------------

    # Higher LST = higher climate exposure
    heat_risk = normalize(
        data["hotseason_lst"]
    )

    # Higher population = higher social impact
    population_impact = normalize(
        data["population_density"]
    )

    # Lower NDVI = higher vegetation impact
    vegetation_impact = (
        1 - normalize(data["ndvi"])
    )

    # Higher building density = higher construction impact
    building_impact = normalize(
        data["building_density"]
    )

    # Higher water coverage = higher environmental sensitivity
    water_sensitivity = normalize(
        data["water_coverage"]
    )

    # Higher road density = stronger existing connectivity
    connectivity = normalize(
        data["road_density"]
    )

    # -----------------------------------------------------
    # HIGHWAY
    # -----------------------------------------------------

    if project_type == "Highway":

        environmental_impact = (
            0.25 * heat_risk
            + 0.25 * population_impact
            + 0.15 * vegetation_impact
            + 0.15 * building_impact
            + 0.10 * water_sensitivity
        )

        connectivity_benefit = (
            0.10 * connectivity
        )

        impact = (
            environmental_impact
            - connectivity_benefit
        )

    # -----------------------------------------------------
    # FLYOVER
    # -----------------------------------------------------

    elif project_type == "Flyover":

        environmental_impact = (
            0.15 * heat_risk
            + 0.25 * population_impact
            + 0.10 * vegetation_impact
            + 0.20 * building_impact
            + 0.10 * water_sensitivity
        )

        # Stronger connectivity requirement for flyovers
        connectivity_benefit = (
            0.30 * connectivity
        )

        impact = (
            environmental_impact
            - connectivity_benefit
        )

        # Very low road connectivity is not ideal
        # for a flyover.
        low_connectivity_penalty = (
            0.10 * (1 - connectivity)
        )

        impact = (
            impact
            + low_connectivity_penalty
        )

    # -----------------------------------------------------
    # BRIDGE
    # -----------------------------------------------------

    elif project_type == "Bridge":

        environmental_impact = (
            0.10 * heat_risk
            + 0.15 * population_impact
            + 0.15 * vegetation_impact
            + 0.10 * building_impact
            + 0.30 * water_sensitivity
        )

        connectivity_benefit = (
            0.20 * connectivity
        )

        impact = (
            environmental_impact
            - connectivity_benefit
        )

        # -------------------------------------------------
        # WATER FEASIBILITY
        # -------------------------------------------------

        water_feasibility = normalize(
            data["water_coverage"]
        )

        # Cells without water should be strongly
        # discouraged for bridge construction.
        no_water_penalty = (
            0.40 * (1 - water_feasibility)
        )

        impact = (
            impact
            + no_water_penalty
        )

    # -----------------------------------------------------
    # GENERAL ROAD
    # -----------------------------------------------------

    else:

        environmental_impact = (
            0.25 * heat_risk
            + 0.25 * population_impact
            + 0.15 * vegetation_impact
            + 0.15 * building_impact
            + 0.10 * water_sensitivity
        )

        connectivity_benefit = (
            0.10 * connectivity
        )

        impact = (
            environmental_impact
            - connectivity_benefit
        )

    # -----------------------------------------------------
    # CONVERT IMPACT TO 0–100
    # -----------------------------------------------------

    data["construction_impact"] = (
        impact.clip(0, 1) * 100
    )

    # Higher suitability = lower impact
    data["construction_suitability"] = (
        100 - data["construction_impact"]
    ).clip(0, 100)

    # -----------------------------------------------------
    # STORE EXPLANATION FEATURES
    # -----------------------------------------------------

    data["heat_score"] = heat_risk

    data["population_score"] = (
        population_impact
    )

    data["vegetation_score"] = (
        vegetation_impact
    )

    data["building_score"] = (
        building_impact
    )

    data["water_score"] = (
        water_sensitivity
    )

    data["connectivity_score"] = (
        connectivity
    )

    return data


# =========================================================
# RANK CANDIDATE LOCATIONS
# =========================================================

def rank_candidate_locations(
    project_type="Highway",
    limit=10
):

    gdf = load_dataset()

    scored_data = calculate_construction_score(
        gdf,
        project_type
    )

    ranked = (
        scored_data
        .sort_values(
            "construction_suitability",
            ascending=False
        )
        .head(limit)
    )

    result = ranked[
        [
            "cell_id",
            "construction_suitability",
            "construction_impact",
            "hotseason_lst",
            "population_density",
            "ndvi",
            "building_density",
            "water_coverage",
            "road_density",
            "heat_score",
            "population_score",
            "vegetation_score",
            "building_score",
            "water_score",
            "connectivity_score",
        ]
    ].copy()

    result["project_type"] = project_type

    return result


# =========================================================
# BEST LOCATION RECOMMENDATION
# =========================================================

def recommend_location(
    project_type="Highway"
):

    ranked = rank_candidate_locations(
        project_type=project_type,
        limit=10
    )

    if ranked.empty:
        raise ValueError(
            "No candidate locations available."
        )

    best = ranked.iloc[0]

    return {
        "project_type": project_type,

        "recommended_cell": int(
            best["cell_id"]
        ),

        "suitability_score": round(
            float(
                best["construction_suitability"]
            ),
            2
        ),

        "impact_score": round(
            float(
                best["construction_impact"]
            ),
            2
        ),

        "lst": round(
            float(
                best["hotseason_lst"]
            ),
            2
        ),

        "population_density": round(
            float(
                best["population_density"]
            ),
            2
        ),

        "ndvi": round(
            float(
                best["ndvi"]
            ),
            3
        ),

        "building_density": round(
            float(
                best["building_density"]
            ),
            4
        ),

        "water_coverage": round(
            float(
                best["water_coverage"]
            ),
            4
        ),

        "road_density": round(
            float(
                best["road_density"]
            ),
            2
        ),

        "connectivity_score": round(
            float(
                best["connectivity_score"]
            ) * 100,
            2
        ),
    }


# =========================================================
# TEST ENGINE
# =========================================================

if __name__ == "__main__":

    project_types = [
        "Highway",
        "Flyover",
        "Bridge",
    ]

    for project_type in project_types:

        recommendation = recommend_location(
            project_type
        )

        print("\n")
        print(
            "ClimateTwin Infrastructure Planner"
        )
        print(
            "-----------------------------------"
        )

        print(
            f"Project Type: {project_type}"
        )

        print(
            f"Recommended Cell: "
            f"{recommendation['recommended_cell']}"
        )

        print(
            f"Suitability Score: "
            f"{recommendation['suitability_score']}"
        )

        print(
            f"Impact Score: "
            f"{recommendation['impact_score']}"
        )

        print(
            f"LST: "
            f"{recommendation['lst']} °C"
        )

        print(
            f"Population Density: "
            f"{recommendation['population_density']}"
        )

        print(
            f"NDVI: "
            f"{recommendation['ndvi']}"
        )

        print(
            f"Building Density: "
            f"{recommendation['building_density']}"
        )

        print(
            f"Water Coverage: "
            f"{recommendation['water_coverage']}"
        )

        print(
            f"Road Density: "
            f"{recommendation['road_density']}"
        )

        print(
            f"Connectivity Score: "
            f"{recommendation['connectivity_score']}"
        )

        print("\nTop Candidate Locations:")

        candidates = rank_candidate_locations(
            project_type,
            10
        )

        print(
            candidates[
                [
                    "cell_id",
                    "construction_suitability",
                    "hotseason_lst",
                    "population_density",
                    "ndvi",
                    "building_density",
                    "water_coverage",
                    "road_density",
                ]
            ].to_string(
                index=False
            )
        )