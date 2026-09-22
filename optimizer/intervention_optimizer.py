import geopandas as gpd
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GRID_FILE = PROJECT_ROOT / "data" / "processed" / "pune_ml_dataset.geojson"


INTERVENTIONS = {
    "tree_plantation": {
        "name": "Tree Plantation",
        "cost_per_percent": 100,
        "cooling_weight": 2.0,
    },
    "cool_roof": {
        "name": "Cool Roofs",
        "cost_per_percent": 80,
        "cooling_weight": 1.2,
    },
    "green_roof": {
        "name": "Green Roofs",
        "cost_per_percent": 120,
        "cooling_weight": 1.0,
    },
    "urban_parks": {
        "name": "Urban Parks",
        "cost_per_percent": 150,
        "cooling_weight": 1.5,
    },
    "reflective_roads": {
        "name": "Reflective Roads",
        "cost_per_percent": 70,
        "cooling_weight": 0.8,
    },
    "green_corridors": {
        "name": "Green Corridors",
        "cost_per_percent": 110,
        "cooling_weight": 1.3,
    },
}


def load_city_data():
    if not GRID_FILE.exists():
        raise FileNotFoundError(f"Dataset not found:\n{GRID_FILE}")

    gdf = gpd.read_file(GRID_FILE)

    required = [
        "cell_id",
        "hotseason_lst",
        "population_density",
        "ndvi",
        "building_density",
        "water_coverage",
        "geometry",
    ]

    missing = [column for column in required if column not in gdf.columns]

    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    return gdf


def normalize(series):
    minimum = series.min()
    maximum = series.max()

    if maximum == minimum:
        return series * 0

    return (series - minimum) / (maximum - minimum)


def calculate_priority(gdf):
    """
    Calculate a spatial priority score for each cell.

    Higher score = higher priority for climate action.
    """

    result = gdf.copy()

    heat_score = normalize(result["hotseason_lst"])
    population_score = normalize(result["population_density"])
    building_score = normalize(result["building_density"])

    # Low vegetation means higher priority.
    vegetation_score = 1 - normalize(result["ndvi"])

    # Low water coverage means higher priority.
    water_score = 1 - normalize(result["water_coverage"])

    result["priority_score"] = (
        0.35 * heat_score
        + 0.30 * population_score
        + 0.15 * vegetation_score
        + 0.10 * building_score
        + 0.10 * water_score
    ) * 100

    result["priority_score"] = result["priority_score"].round(2)

    return result


def calculate_intervention_cost(intervention, level):
    if intervention not in INTERVENTIONS:
        raise ValueError(f"Unknown intervention: {intervention}")

    level = max(0, min(level, 100))

    return level * INTERVENTIONS[intervention]["cost_per_percent"]


def calculate_intervention_benefit(intervention, level, priority_score=100):
    """
    Calculate estimated cooling benefit.

    Priority score makes interventions in more vulnerable
    locations more valuable.
    """

    if intervention not in INTERVENTIONS:
        raise ValueError(f"Unknown intervention: {intervention}")

    level = max(0, min(level, 100))

    base_benefit = (
        level
        * INTERVENTIONS[intervention]["cooling_weight"]
        / 100
    )

    priority_factor = 0.5 + 0.5 * (priority_score / 100)

    return base_benefit * priority_factor


def optimize_interventions(budget, step=10):
    """
    Spatially-aware climate intervention optimizer.

    The optimizer:
    1. Loads Pune spatial data.
    2. Calculates vulnerability/priority.
    3. Identifies high-priority cells.
    4. Evaluates intervention efficiency.
    5. Allocates the available budget.
    """

    budget = float(budget)

    if budget <= 0:
        return {
            "budget": budget,
            "recommended_plan": {},
            "total_cost": 0,
            "estimated_cooling_benefit": 0,
            "priority_cells": [],
            "average_priority_score": 0,
        }

    gdf = load_city_data()

    # Calculate spatial priority.
    gdf = calculate_priority(gdf)

    # Highest-priority locations first.
    priority_gdf = gdf.sort_values(
        "priority_score",
        ascending=False
    )

    # Top 10% of cells are considered priority intervention zones.
    number_of_priority_cells = max(
        1,
        int(len(priority_gdf) * 0.10)
    )

    priority_cells = priority_gdf.head(
        number_of_priority_cells
    )

    average_priority_score = float(
        priority_cells["priority_score"].mean()
    )

    # Calculate average intervention efficiency
    # within the high-priority zone.
    intervention_efficiency = {}

    for name, details in INTERVENTIONS.items():

        cost = details["cost_per_percent"]

        benefit = calculate_intervention_benefit(
            name,
            10,
            average_priority_score
        )

        intervention_efficiency[name] = benefit / cost

    # Rank interventions by benefit per rupee.
    ranked_interventions = sorted(
        intervention_efficiency.items(),
        key=lambda item: item[1],
        reverse=True
    )

    recommended_plan = {
        name: 0
        for name in INTERVENTIONS
    }

    remaining_budget = budget
    total_cost = 0
    total_benefit = 0

    # Allocate budget using the most efficient interventions first.
    for intervention, efficiency in ranked_interventions:

        if remaining_budget <= 0:
            break

        cost_per_step = calculate_intervention_cost(
            intervention,
            step
        )

        while (
            remaining_budget >= cost_per_step
            and recommended_plan[intervention] < 100
        ):

            recommended_plan[intervention] += step

            remaining_budget -= cost_per_step
            total_cost += cost_per_step

            total_benefit += calculate_intervention_benefit(
                intervention,
                step,
                average_priority_score
            )

    return {
        "budget": round(budget, 2),
        "recommended_plan": recommended_plan,
        "total_cost": round(total_cost, 2),
        "estimated_cooling_benefit": round(total_benefit, 2),
        "priority_cells": [
            {
                "cell_id": int(row.cell_id),
                "priority_score": round(
                    float(row.priority_score),
                    2
                ),
                "hotseason_lst": round(
                    float(row.hotseason_lst),
                    2
                ),
                "population_density": round(
                    float(row.population_density),
                    2
                ),
            }
            for row in priority_cells.head(10).itertuples()
        ],
        "priority_zone_size": number_of_priority_cells,
        "average_priority_score": round(
            average_priority_score,
            2
        ),
    }


if __name__ == "__main__":

    budget = 5000

    result = optimize_interventions(
        budget=budget,
        step=10
    )

    print("\nClimateTwin Spatial Intervention Optimizer")
    print("=" * 50)

    print(f"Budget: ₹{result['budget']:,.0f}")
    print(
        f"Total Cost: ₹{result['total_cost']:,.0f}"
    )

    print(
        f"Estimated Cooling Benefit: "
        f"{result['estimated_cooling_benefit']:.2f}°C"
    )

    print(
        f"Priority Zone Size: "
        f"{result['priority_zone_size']} cells"
    )

    print(
        f"Average Priority Score: "
        f"{result['average_priority_score']:.2f}/100"
    )

    print("\nRecommended Plan:")

    for intervention, level in result[
        "recommended_plan"
    ].items():

        if level > 0:
            print(
                f"  {INTERVENTIONS[intervention]['name']}: "
                f"{level}%"
            )

    print("\nTop Priority Cells:")

    for cell in result["priority_cells"]:

        print(
            f"  Cell {cell['cell_id']} | "
            f"Priority {cell['priority_score']} | "
            f"LST {cell['hotseason_lst']}°C"
        )