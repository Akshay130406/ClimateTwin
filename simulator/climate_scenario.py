import geopandas as gpd
import joblib


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


def load_baseline_data():
    """Load the Pune ML grid."""

    gdf = gpd.read_file(GRID_FILE)

    required_columns = [
        "cell_id",
        "hotseason_lst",
        "ndvi",
        "population",
        "population_density",
        "building_density",
        "building_count",
        "road_density",
        "road_count",
        "water_coverage",
        "geometry",
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


def classify_risk(lst):
    """Classify LST into ClimateTwin risk levels."""

    if lst >= 42:
        return "Very High"

    elif lst >= 40:
        return "High"

    elif lst >= 38:
        return "Moderate"

    elif lst >= 36:
        return "Low"

    return "Very Low"


def apply_scenario(
    gdf,
    temperature_increase=0.0,
    vegetation_decrease=0.0,
    rainfall_change=0.0,
    urbanization_increase=0.0,
    population_growth=0.0,
    water_availability_change=0.0,
):
    """
    Apply scenario changes to the Pune spatial grid.

    The Random Forest model predicts LST from the
    modified environmental and urban features.

    Temperature, rainfall and water changes are
    scenario inputs. Because the current trained model
    does not contain temperature/rainfall as predictors,
    those variables are kept as scenario metadata here
    rather than artificially injected into the prediction.

    Results are modeled scenario estimates, not exact
    climate forecasts.
    """

    scenario = gdf.copy()

    # --------------------------------------------------
    # 1. Vegetation change
    # --------------------------------------------------

    vegetation_factor = 1 - (
        vegetation_decrease / 100
    )

    scenario["ndvi"] = (
        scenario["ndvi"] * vegetation_factor
    )

    scenario["ndvi"] = scenario["ndvi"].clip(0, 1)

    # --------------------------------------------------
    # 2. Urbanization change
    # --------------------------------------------------

    urbanization_factor = 1 + (
        urbanization_increase / 100
    )

    scenario["building_density"] = (
        scenario["building_density"]
        * urbanization_factor
    )

    scenario["road_density"] = (
        scenario["road_density"]
        * urbanization_factor
    )

    # Building count is also increased proportionally.
    scenario["building_count"] = (
        scenario["building_count"]
        * urbanization_factor
    )

    # Road count is also increased proportionally.
    scenario["road_count"] = (
        scenario["road_count"]
        * urbanization_factor
    )

    # --------------------------------------------------
    # 3. Population growth
    # --------------------------------------------------

    population_factor = 1 + (
        population_growth / 100
    )

    scenario["population"] = (
        scenario["population"]
        * population_factor
    )

    scenario["population_density"] = (
        scenario["population_density"]
        * population_factor
    )

    # --------------------------------------------------
    # 4. Water availability
    # --------------------------------------------------

    water_factor = 1 + (
        water_availability_change / 100
    )

    scenario["water_coverage"] = (
        scenario["water_coverage"]
        * water_factor
    )

    scenario["water_coverage"] = (
        scenario["water_coverage"].clip(0, 1)
    )

    # --------------------------------------------------
    # 5. Load trained Random Forest
    # --------------------------------------------------

    model = joblib.load(MODEL_FILE)

    # --------------------------------------------------
    # 6. Predict scenario LST
    # --------------------------------------------------

    X = scenario[FEATURES].copy()

    scenario["scenario_lst"] = model.predict(X)

    # --------------------------------------------------
    # 7. Apply explicit temperature scenario
    # --------------------------------------------------
    #
    # The current ML model predicts based on urban/
    # environmental features and does not include
    # temperature as an input feature.
    #
    # Therefore the temperature scenario is applied
    # transparently as a scenario adjustment.
    #
    # This is a prototype assumption and should later
    # be calibrated with additional climate data.
    # --------------------------------------------------

    scenario["scenario_lst"] = (
        scenario["scenario_lst"]
        + temperature_increase
    )

    # --------------------------------------------------
    # 8. Rainfall scenario adjustment
    # --------------------------------------------------
    #
    # Rainfall is currently not a trained model feature.
    # Keep it recorded as metadata instead of inventing
    # a physical relationship.
    # --------------------------------------------------

    scenario["rainfall_change"] = rainfall_change

    # --------------------------------------------------
    # 9. Store scenario parameters
    # --------------------------------------------------

    scenario["temperature_increase"] = temperature_increase
    scenario["vegetation_decrease"] = vegetation_decrease
    scenario["urbanization_increase"] = urbanization_increase
    scenario["population_growth"] = population_growth
    scenario["water_availability_change"] = (
        water_availability_change
    )

    # --------------------------------------------------
    # 10. Risk classification
    # --------------------------------------------------

    scenario["risk_level"] = (
        scenario["scenario_lst"]
        .apply(classify_risk)
    )

    return scenario


def calculate_summary(baseline, scenario):
    """Generate baseline vs scenario statistics."""

    baseline_lst = baseline["hotseason_lst"]

    scenario_lst = scenario["scenario_lst"]

    baseline_average = float(
        baseline_lst.mean()
    )

    scenario_average = float(
        scenario_lst.mean()
    )

    baseline_high = int(
        (baseline_lst >= 40).sum()
    )

    scenario_high = int(
        (scenario_lst >= 40).sum()
    )

    baseline_very_high = int(
        (baseline_lst >= 42).sum()
    )

    scenario_very_high = int(
        (scenario_lst >= 42).sum()
    )

    exposed_population = float(
        scenario.loc[
            scenario["scenario_lst"] >= 40,
            "population",
        ].sum()
    )

    return {
        "baseline_average_lst": round(
            baseline_average,
            2,
        ),

        "scenario_average_lst": round(
            scenario_average,
            2,
        ),

        "lst_change": round(
            scenario_average
            - baseline_average,
            2,
        ),

        "baseline_high_risk_cells": (
            baseline_high
        ),

        "scenario_high_risk_cells": (
            scenario_high
        ),

        "change_in_high_risk_cells": (
            scenario_high
            - baseline_high
        ),

        "baseline_very_high_risk_cells": (
            baseline_very_high
        ),

        "scenario_very_high_risk_cells": (
            scenario_very_high
        ),

        "change_in_very_high_risk_cells": (
            scenario_very_high
            - baseline_very_high
        ),

        "scenario_population_exposed": round(
            exposed_population
        ),
    }


if __name__ == "__main__":

    print(
        "Loading Pune baseline data..."
    )

    baseline = load_baseline_data()

    print(
        f"Loaded {len(baseline)} spatial cells."
    )

    print(
        "\nLoading ClimateTwin Random Forest model..."
    )

    scenario = apply_scenario(
        baseline,

        temperature_increase=2.0,

        vegetation_decrease=10.0,

        rainfall_change=-10.0,

        urbanization_increase=10.0,

        population_growth=10.0,

        water_availability_change=-10.0,
    )

    summary = calculate_summary(
        baseline,
        scenario,
    )

    print(
        "\nClimateTwin Scenario Results"
    )

    print(
        "--------------------------------"
    )

    for key, value in summary.items():
        print(
            f"{key}: {value}"
        )

    print(
        "\nScenario Risk Distribution:"
    )

    print(
        scenario["risk_level"]
        .value_counts()
    )