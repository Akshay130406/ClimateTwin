
from pathlib import Path
import os
import json
import logging

import geopandas as gpd
import pandas as pd
import joblib
from dotenv import load_dotenv
from google import genai
from google.genai import types


# ---------------------------------------------------------
# LOGGING
# ---------------------------------------------------------

logger = logging.getLogger(__name__)


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

SYSTEM_INSTRUCTION = """
You are ClimateTwin AI, a helpful general-purpose assistant. Answer questions
across topics clearly, accurately, and at an appropriate level of detail. Do
not force unrelated questions into a climate or ClimateTwin framing.

For questions about climate, the environment, or urban planning, draw on your
expertise in urban climate adaptation and climate-risk decision support. Use
provided ClimateTwin data when a question requires local project data. Do not
invent Pune neighborhood names, locations, statistics, or cell identifiers.
MODIS LST means Land Surface Temperature, not air temperature; do not infer
causation from the data. Answer the specific question rather than defaulting to
heat mitigation. Keep climate-data answers concise and decision-focused. When
listing cells, use actual cell_id values and mention at most the three most
relevant cells. Start directly with the answer.
""".strip()


def build_chat_history(history):
    messages = []

    for item in history or []:
        if not isinstance(item, dict):
            raise ValueError("Chat history entries must be objects.")

        role = item.get("role")
        content = item.get("content")
        if role == "assistant":
            role = "model"

        if role not in {"user", "model"} or not isinstance(content, str):
            raise ValueError("Chat history entries require a user or assistant role and text content.")

        if content.strip():
            messages.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=content)],
                )
            )

    return messages


def generate_with_gemini(question, top_cells, history=None):

    if not GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY not found."
        )

    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(timeout=30_000),
    )

    cells_json = top_cells.to_dict(
        orient="records"
    )

    chat = client.chats.create(
        model="gemini-3.8-flash",
        history=build_chat_history(history),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.3,
        ),
    )

    context = (
        "ClimateTwin priority data (JSON):\n"
        f"{json.dumps(cells_json, indent=2)}\n\n"
        f"User question:\n{question}"
    )
    response = chat.send_message(context)

    if response and response.text:
        return response.text.strip()

    raise RuntimeError("Gemini returned an empty response.")


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

def ask_climate_assistant(question, history=None):

    if not question or not question.strip():
        return "Please enter a question."

    # Load dataset and calculate scores
    try:
        gdf = load_dataset()

        top_cells = get_top_priority_cells(
            gdf,
            limit=10
        )

    except Exception:
        logger.exception(
            "Failed to load ClimateTwin dataset or calculate priority scores."
        )
        raise

    # Try Gemini, otherwise use local fallback
    try:
        return generate_with_gemini(
            question,
            top_cells,
            history=history,
        )

    except Exception as error:
        error_message = str(error)

        # Redact API key from logs
        if GEMINI_API_KEY:
            error_message = error_message.replace(
                GEMINI_API_KEY,
                "[REDACTED]"
            )

        logger.error(
            "Gemini generation failed (%s): %s",
            type(error).__name__,
            error_message
        )

        logger.info(
            "Using local ClimateTwin fallback response."
        )

        return generate_local_fallback(
            question,
            top_cells
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
