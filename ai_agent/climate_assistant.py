from pathlib import Path
import os
import json
import geopandas as gpd
import pandas as pd
import joblib
from dotenv import load_dotenv
from google import genai


# ---------------------------------------------------------
# PROJECT PATHS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATASET_FILE = PROJECT_ROOT / "data" / "processed" / "pune_ml_dataset.geojson"
MODEL_FILE = PROJECT_ROOT / "ml" / "models" / "heat_lst_random_forest.joblib"


# ---------------------------------------------------------
# ENVIRONMENT
# ---------------------------------------------------------

load_dotenv(PROJECT_ROOT / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ---------------------------------------------------------
# FEATURES
# ---------------------------------------------------------

FEATURES = [
    "ndvi",
    "population_density",
    "building_density",
    "building_count",
    "road_density",
    "road_count",
    "water_coverage",
]


# ---------------------------------------------------------
# LOAD DATASET
# ---------------------------------------------------------

def load_dataset():
    gdf = gpd.read_file(DATASET_FILE)

    required_columns = [
        "cell_id",
        "hotseason_lst",
        "ndvi",
        "population_density",
        "building_density",
        "building_count",
        "road_density",
        "road_count",
        "water_coverage",
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


# ---------------------------------------------------------
# PRIORITY SCORE
# ---------------------------------------------------------

def calculate_priority_score(gdf):
    data = gdf.copy()

    def normalize(series):
        minimum = series.min()
        maximum = series.max()

        if maximum == minimum:
            return pd.Series(0, index=series.index)

        return (series - minimum) / (maximum - minimum)

    heat = normalize(data["hotseason_lst"])
    population = normalize(data["population_density"])
    vegetation_stress = 1 - normalize(data["ndvi"])
    building = normalize(data["building_density"])
    water_stress = 1 - normalize(data["water_coverage"])

    data["priority_score"] = (
        0.35 * heat
        + 0.30 * population
        + 0.15 * vegetation_stress
        + 0.10 * building
        + 0.10 * water_stress
    ) * 100

    return data


# ---------------------------------------------------------
# TOP PRIORITY CELLS
# ---------------------------------------------------------

def get_top_priority_cells(gdf, limit=10):
    data = calculate_priority_score(gdf)

    top_cells = (
        data.sort_values(
            "priority_score",
            ascending=False
        )
        .head(limit)
    )

    return top_cells[
        [
            "cell_id",
            "priority_score",
            "hotseason_lst",
            "population_density",
            "ndvi",
            "building_density",
            "road_density",
            "water_coverage",
        ]
    ]


# ---------------------------------------------------------
# GEMINI RESPONSE
# ---------------------------------------------------------

def generate_with_gemini(question, top_cells):

    if not GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY not found."
        )

    client = genai.Client(
        api_key=GEMINI_API_KEY
    )

    cells_json = top_cells.to_dict(
        orient="records"
    )

    prompt = f"""
You are ClimateTwin AI, an urban climate decision-support assistant.

User question:
{question}

Actual ClimateTwin priority data:
{json.dumps(cells_json, indent=2)}

Rules:
- Answer the user's question directly.
- Use the provided ClimateTwin data whenever the question requires data.
- Do not answer every question with the same heat-mitigation response.
- If the user asks about a specific concept, explain that concept.
- If the user asks about cells, use the actual cell_id values.
- Never invent Pune neighborhood names, locations, or statistics.
- MODIS LST means Land Surface Temperature, not air temperature.
- Do not claim causal relationships.
- Provide practical decision-support information.
- Keep the response concise and decision-focused.
- Maximum 5-7 short lines.
- Mention only the top 3 relevant cells when cell-level data is needed.
- Do not provide long explanations.
- Do not use tables.
- Use short bullet points when listing cells.
- Start directly with the answer.
"""

    models = [
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
    ]

    last_error = None

    for model_name in models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )

            if response and response.text:
                return response.text.strip()

        except Exception as error:
            last_error = error
            continue

    raise RuntimeError(
        f"Gemini unavailable: {last_error}"
    )


# ---------------------------------------------------------
# LOCAL FALLBACK
# ---------------------------------------------------------

def generate_local_fallback(question, top_cells):

    rows = top_cells.to_dict(
        orient="records"
    )

    answer = "Top priority cells for heat mitigation:\n\n"

    for row in rows[:3]:
        answer += (
            f"• Cell {int(row['cell_id'])} — "
            f"Priority {row['priority_score']:.2f}, "
            f"LST {row['hotseason_lst']:.2f}°C\n"
        )

    answer += (
        "\nThese cells have higher combined heat, population, "
        "vegetation, building, and water-stress indicators."
    )

    return answer


# ---------------------------------------------------------
# MAIN AI ASSISTANT
# ---------------------------------------------------------

def ask_climate_assistant(question):

    if not question or not question.strip():
        return "Please enter a question."

    gdf = load_dataset()

    top_cells = get_top_priority_cells(
        gdf,
        limit=10
    )

    try:
        return generate_with_gemini(
            question,
            top_cells
        )

    except Exception as error:
        raise RuntimeError(
            f"Gemini error: {error}"
        )


# ---------------------------------------------------------
# CLI TEST
# ---------------------------------------------------------

if __name__ == "__main__":

    question = input(
        "Ask ClimateTwin AI: "
    )

    answer = ask_climate_assistant(
        question
    )

    print("\nClimateTwin AI:\n")
    print(answer)