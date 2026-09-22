from pathlib import Path

import geopandas as gpd
import joblib
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

DATA_FILE = Path("data/processed/pune_ml_dataset.geojson")
MODEL_DIR = Path("ml/models")

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# Load dataset
# ---------------------------------------------------------

print("Loading dataset...")

gdf = gpd.read_file(DATA_FILE)

print(f"Rows: {len(gdf)}")


# ---------------------------------------------------------
# ML features
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

TARGET = "hotseason_lst"


X = gdf[FEATURES]
y = gdf[TARGET]


# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

print("\nFeatures:")
for feature in FEATURES:
    print(f"  - {feature}")

print(f"\nTarget: {TARGET}")

print("\nMissing values:")
print(X.isna().sum())

print("\nTarget statistics:")
print(y.describe())


# ---------------------------------------------------------
# Train / test split
# ---------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTrain samples:", len(X_train))
print("Test samples:", len(X_test))


# ---------------------------------------------------------
# Random Forest
# ---------------------------------------------------------

print("\nTraining Random Forest...")

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=15,
    min_samples_leaf=3,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)


# ---------------------------------------------------------
# Prediction
# ---------------------------------------------------------

y_pred = model.predict(X_test)


# ---------------------------------------------------------
# Evaluation
# ---------------------------------------------------------

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)


print("\nModel Performance")
print("-------------------------")
print(f"MAE  : {mae:.4f} °C")
print(f"RMSE : {rmse:.4f} °C")
print(f"R²   : {r2:.4f}")


# ---------------------------------------------------------
# Feature importance
# ---------------------------------------------------------

print("\nFeature Importance")
print("-------------------------")

importance = model.feature_importances_

feature_importance = sorted(
    zip(FEATURES, importance),
    key=lambda x: x[1],
    reverse=True
)

for feature, score in feature_importance:
    print(f"{feature:25s}: {score:.4f}")


# ---------------------------------------------------------
# Save model
# ---------------------------------------------------------

model_path = MODEL_DIR / "heat_lst_random_forest.joblib"

joblib.dump(model, model_path)

print("\nModel saved:")
print(model_path)