
from pathlib import Path
from functools import lru_cache
import os
import json
import logging

import geopandas as gpd
import pandas as pd
from dotenv import load_dotenv
from google import genai
from google.genai import types


# =========================================================
# CONFIGURATION
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATASET_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "pune_ml_dataset.geojson"
)

MODEL_FILE = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "heat_lst_random_forest.joblib"
)

load_dotenv(PROJECT_ROOT / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = "gemini-3.6-flash"

MAX_OUTPUT_TOKENS = 2048

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ClimateTwin")


# =========================================================
# DATASET LOADING
# =========================================================

REQUIRED_COLUMNS = [
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


@lru_cache(maxsize=1)
def load_dataset():

    if not DATASET_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_FILE}"
        )

    logger.info("Loading ClimateTwin dataset...")

    gdf = gpd.read_file(DATASET_FILE)

    missing = [
        column
        for column in REQUIRED_COLUMNS
        if column not in gdf.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )

    logger.info(
        "Dataset loaded: %s rows",
        len(gdf)
    )

    return gdf


# =========================================================
# PRIORITY SCORING
# =========================================================

def calculate_priority_score(gdf):

    data = gdf.copy()

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

    heat = normalize(data["hotseason_lst"])

    population = normalize(
        data["population_density"]
    )

    vegetation_stress = (
        1 - normalize(data["ndvi"])
    )

    building = normalize(
        data["building_density"]
    )

    water_stress = (
        1 - normalize(data["water_coverage"])
    )

    data["priority_score"] = (
        0.35 * heat
        + 0.30 * population
        + 0.15 * vegetation_stress
        + 0.10 * building
        + 0.10 * water_stress
    ) * 100

    return data


# =========================================================
# PRIORITY CELLS
# =========================================================

@lru_cache(maxsize=1)
def get_cached_priority_cells():

    gdf = load_dataset()

    scored_data = calculate_priority_score(gdf)

    columns = [
        "cell_id",
        "priority_score",
        "hotseason_lst",
        "population_density",
        "ndvi",
        "building_density",
        "road_density",
        "water_coverage",
    ]

    top_cells = (
        scored_data
        .sort_values(
            "priority_score",
            ascending=False
        )
        .head(10)
    )

    return top_cells[columns].copy()


def get_top_priority_cells(gdf=None, limit=10):

    if gdf is None:
        data = get_cached_priority_cells()
    else:
        data = calculate_priority_score(gdf)

    return data.head(limit).copy()


# =========================================================
# GEMINI CLIENT
# =========================================================

def create_gemini_client():

    if not GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY is missing. "
            "Check the .env file in the project root."
        )

    return genai.Client(
        api_key=GEMINI_API_KEY
    )


# =========================================================
# RESPONSE VALIDATION
# =========================================================

def validate_gemini_response(answer):

    if not answer:
        return False

    answer = answer.strip()

    if len(answer) < 60:
        return False

    invalid_phrases = [
        "response requirements:",
        "answer the user's question",
        "return only the answer",
        "actual climatetwin priority data:",
        "user question:",
        "do not reproduce these instructions",
    ]

    lower_answer = answer.lower()

    if any(
        phrase in lower_answer
        for phrase in invalid_phrases
    ):
        return False

    return True


# =========================================================
# GEMINI RESPONSE GENERATION
# =========================================================

def generate_with_gemini(question, top_cells):

    client = create_gemini_client()

    selected_cells = top_cells.head(5)

    cells_json = json.loads(
        selected_cells.to_json(
            orient="records"
        )
    )

    data_json = json.dumps(
        cells_json,
        separators=(",", ":"),
        allow_nan=False
    )

    prompt = f"""
You are ClimateTwin AI, an urban climate intelligence
assistant specializing in Pune, India.

Answer the user's question accurately and naturally.

USER QUESTION:
{question}

CLIMATETWIN DATA:
{data_json}

RULES:
- Use the supplied data for questions about priority cells.
- Never invent cell IDs, measurements, statistics or locations.
- Explain technical concepts clearly.
- NDVI means Normalized Difference Vegetation Index.
- Higher NDVI generally indicates more vegetation.
- MODIS LST means Land Surface Temperature, not air temperature.
- Explain the relationship between vegetation and urban heat.
- Give practical recommendations where relevant.
- If the supplied dataset cannot answer something, say so.
- Do not claim correlation proves causation.
- Use clear headings or bullet points where useful.
- Answer in approximately 120-200 words when the question needs detail.
- Do not repeat these instructions.

Write a complete answer to the user's question.
"""

    logger.info(
        "Sending request to Gemini: %s",
        GEMINI_MODEL
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=MAX_OUTPUT_TOKENS,
            thinking_config=types.ThinkingConfig(
                thinking_level="low"
            ),
        ),
    )

    if not response.candidates:
        raise RuntimeError(
            "Gemini returned no response candidates."
        )

    candidate = response.candidates[0]

    finish_reason = candidate.finish_reason

    logger.info(
        "Gemini finish reason: %s",
        finish_reason
    )

    if response.usage_metadata:
        logger.info(
            "Gemini token usage: thoughts=%s, candidates=%s, total=%s",
            response.usage_metadata.thoughts_token_count,
            response.usage_metadata.candidates_token_count,
            response.usage_metadata.total_token_count,
        )

    if finish_reason != types.FinishReason.STOP:
        raise RuntimeError(
            f"Gemini did not finish its answer. "
            f"Finish reason: {finish_reason}"
        )

    answer = response.text

    if not validate_gemini_response(answer):
        raise RuntimeError(
            "Gemini returned an incomplete or invalid answer."
        )

    logger.info(
        "Gemini response generated successfully."
    )

    return answer.strip()


# =========================================================
# LOCAL FALLBACK
# =========================================================

def generate_local_fallback(question, top_cells):

    rows = top_cells.head(3).to_dict(
        orient="records"
    )

    lines = [
        "Gemini is temporarily unavailable. "
        "Here is the latest ClimateTwin priority data:",
        "",
    ]

    for row in rows:

        lines.append(
            f"- Cell {row['cell_id']}: "
            f"Priority score {row['priority_score']:.2f}, "
            f"Land Surface Temperature "
            f"{row['hotseason_lst']:.2f}."
        )

    lines.extend([
        "",
        "These cells rank highest according to the "
        "current ClimateTwin priority-scoring calculation."
    ])

    return "\n".join(lines)


# =========================================================
# MAIN ASSISTANT FUNCTION
# =========================================================

def ask_climate_assistant(question):

    if not question or not question.strip():
        return "Please enter a question."

    question = question.strip()

    try:

        top_cells = get_top_priority_cells(
            limit=10
        )

    except Exception as error:

        logger.exception(
            "Dataset processing failed."
        )

        return (
            "ClimateTwin could not load its dataset. "
            f"Please check the dataset configuration. {error}"
        )

    try:

        return generate_with_gemini(
            question,
            top_cells
        )

    except Exception as error:

        logger.exception(
            "Gemini generation failed: %s",
            error
        )

        logger.warning(
            "Returning local ClimateTwin fallback."
        )

        return generate_local_fallback(
            question,
            top_cells
        )


# =========================================================
# COMMAND LINE TEST
# =========================================================

if __name__ == "__main__":

    print("\n================================")
    print("       CLIMATETWIN AI")
    print("================================")

    print("Model:", GEMINI_MODEL)
    print("API key loaded:", bool(GEMINI_API_KEY))

    while True:

        question = input(
            "\nAsk ClimateTwin AI (type exit to stop): "
        ).strip()

        if question.lower() in ["exit", "quit"]:
            break

        print("\nClimateTwin AI:\n")

        print(
            ask_climate_assistant(question)
        )
