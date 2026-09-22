import matplotlib

matplotlib.use("Agg")

import geopandas as gpd
import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt


# ==================================================
# ClimateTwin - SHAP Explainability
# ==================================================

DATASET = "data/processed/pune_ml_dataset.geojson"

MODEL_PATH = "ml/models/heat_lst_random_forest.joblib"

OUTPUT_DIR = "ml/models"


FEATURES = [
    "ndvi",
    "population_density",
    "building_density",
    "building_count",
    "road_density",
    "road_count",
    "water_coverage"
]

TARGET = "hotseason_lst"


# ==================================================
# 1. Load dataset
# ==================================================

print("Loading dataset...")

gdf = gpd.read_file(DATASET)

X = gdf[FEATURES].copy()
y = gdf[TARGET].copy()

print(f"Rows: {len(gdf)}")


# ==================================================
# 2. Load trained model
# ==================================================

print("\nLoading trained model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully.")


# ==================================================
# 3. Create SHAP explainer
# ==================================================

print("\nCreating SHAP explainer...")

explainer = shap.TreeExplainer(model)

print("SHAP explainer created.")


# ==================================================
# 4. Calculate SHAP values
# ==================================================

print("\nCalculating SHAP values...")

shap_values = explainer.shap_values(X)

print("SHAP calculation complete.")


# ==================================================
# 5. Global feature importance
# ==================================================

print("\nCalculating global feature importance...")

mean_abs_shap = pd.DataFrame({
    "feature": FEATURES,
    "mean_absolute_shap": abs(shap_values).mean(axis=0)
})

mean_abs_shap = mean_abs_shap.sort_values(
    "mean_absolute_shap",
    ascending=False
)

print("\nSHAP Feature Importance")
print("=" * 50)

for _, row in mean_abs_shap.iterrows():

    print(
        f"{row['feature']:<25} "
        f"{row['mean_absolute_shap']:.4f}"
    )


# ==================================================
# 6. Save SHAP importance
# ==================================================

importance_path = (
    f"{OUTPUT_DIR}/shap_feature_importance.csv"
)

mean_abs_shap.to_csv(
    importance_path,
    index=False
)

print(
    f"\nFeature importance saved:"
    f"\n{importance_path}"
)


# ==================================================
# 7. SHAP summary plot
# ==================================================

print("\nCreating SHAP summary plot...")

plt.figure()

shap.summary_plot(
    shap_values,
    X,
    show=False
)

plt.tight_layout()

summary_path = (
    f"{OUTPUT_DIR}/shap_summary_plot.png"
)

plt.savefig(
    summary_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    f"SHAP summary plot saved:"
    f"\n{summary_path}"
)


# ==================================================
# 8. SHAP bar plot
# ==================================================

print("\nCreating SHAP importance bar plot...")

plt.figure()

shap.summary_plot(
    shap_values,
    X,
    plot_type="bar",
    show=False
)

plt.tight_layout()

bar_path = (
    f"{OUTPUT_DIR}/shap_bar_plot.png"
)

plt.savefig(
    bar_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    f"SHAP bar plot saved:"
    f"\n{bar_path}"
)


# ==================================================
# 9. Calculate SHAP values for every cell
# ==================================================

print("\nCreating cell-level explanations...")

shap_df = pd.DataFrame(
    shap_values,
    columns=[
        f"shap_{feature}"
        for feature in FEATURES
    ]
)

# Add cell ID
shap_df["cell_id"] = gdf["cell_id"].values

# Add predicted LST
shap_df["predicted_lst"] = model.predict(X)

# Add observed LST
shap_df["observed_lst"] = y.values


# ==================================================
# 10. Save cell-level explanations
# ==================================================

cell_shap_path = (
    f"{OUTPUT_DIR}/cell_shap_values.csv"
)

shap_df.to_csv(
    cell_shap_path,
    index=False
)

print(
    f"Cell-level SHAP values saved:"
    f"\n{cell_shap_path}"
)


# ==================================================
# 11. Example explanation
# ==================================================

print("\n")
print("=" * 60)
print("EXAMPLE CELL EXPLANATION")
print("=" * 60)

example_index = 0

example_values = shap_values[example_index]

example_df = pd.DataFrame({
    "feature": FEATURES,
    "shap_value": example_values
})

example_df["absolute_shap"] = (
    example_df["shap_value"].abs()
)

example_df = example_df.sort_values(
    "absolute_shap",
    ascending=False
)

print(
    f"\nCell ID: "
    f"{gdf.iloc[example_index]['cell_id']}"
)

print(
    f"Observed LST: "
    f"{y.iloc[example_index]:.2f} °C"
)

print(
    f"Predicted LST: "
    f"{model.predict(X.iloc[[example_index]])[0]:.2f} °C"
)

print("\nTop contributing factors:")

for _, row in example_df.head(5).iterrows():

    direction = (
        "increases"
        if row["shap_value"] > 0
        else "decreases"
    )

    print(
        f"  {row['feature']}: "
        f"{row['shap_value']:+.4f} "
        f"({direction} predicted LST)"
    )


print("\n")
print("=" * 60)
print("PHASE 5 SHAP ANALYSIS COMPLETE")
print("=" * 60)