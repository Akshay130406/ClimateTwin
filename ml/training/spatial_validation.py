import geopandas as gpd
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==================================================
# ClimateTwin - Spatial Validation
# ==================================================

DATASET = "data/processed/pune_ml_dataset.geojson"

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

print(f"Rows: {len(gdf)}")


# ==================================================
# 2. Prepare features and target
# ==================================================

X = gdf[FEATURES].copy()
target = gdf[TARGET].copy()

print("\nFeatures:")

for feature in FEATURES:
    print(f"  - {feature}")

print(f"\nTarget: {TARGET}")


# Check missing values
print("\nMissing values:")

print(X.isnull().sum())

print(f"\nTarget missing values: {target.isnull().sum()}")


# ==================================================
# 3. Create spatial blocks
# ==================================================

print("\nCreating spatial blocks...")

# Convert to UTM so that coordinates are measured in metres
gdf_projected = gdf.to_crs(epsg=32643)

# Calculate centroid of each grid cell
centroids = gdf_projected.geometry.centroid

x_coord = centroids.x
y_coord = centroids.y


# Divide Pune into a 5 x 5 spatial grid
gdf["spatial_x"] = pd.cut(
    x_coord,
    bins=5,
    labels=False,
    include_lowest=True
)

gdf["spatial_y"] = pd.cut(
    y_coord,
    bins=5,
    labels=False,
    include_lowest=True
)


# Create block ID
gdf["spatial_block"] = (
    gdf["spatial_x"].astype(str)
    + "_"
    + gdf["spatial_y"].astype(str)
)


blocks = sorted(gdf["spatial_block"].unique())

print(f"Spatial blocks: {len(blocks)}")


# ==================================================
# 4. Spatial validation
# ==================================================

print("\nRunning spatial validation...")

results = []


for test_block in blocks:

    # Training data = all other geographic blocks
    train_mask = gdf["spatial_block"] != test_block

    # Testing data = current geographic block
    test_mask = gdf["spatial_block"] == test_block

    X_train = X.loc[train_mask]
    X_test = X.loc[test_mask]

    y_train = target.loc[train_mask]
    y_test = target.loc[test_mask]

    # Skip empty blocks
    if len(X_test) == 0:
        continue

    print(f"\nTesting block: {test_block}")
    print(f"Train samples: {len(X_train)}")
    print(f"Test samples : {len(X_test)}")


    # --------------------------------------------------
    # Train Random Forest
    # --------------------------------------------------

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)


    # --------------------------------------------------
    # Predictions
    # --------------------------------------------------

    predictions = model.predict(X_test)


    # --------------------------------------------------
    # Metrics
    # --------------------------------------------------

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            predictions
        )
    )

    r2 = r2_score(
        y_test,
        predictions
    )


    print(f"MAE  : {mae:.4f} °C")
    print(f"RMSE : {rmse:.4f} °C")
    print(f"R²   : {r2:.4f}")


    results.append({
        "block": test_block,
        "samples": len(X_test),
        "mae": mae,
        "rmse": rmse,
        "r2": r2
    })


# ==================================================
# 5. Results
# ==================================================

results_df = pd.DataFrame(results)


print("\n")
print("=" * 60)
print("SPATIAL VALIDATION RESULTS")
print("=" * 60)


print("\nPer-block results:")

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}"
    )
)


# ==================================================
# 6. Average spatial performance
# ==================================================

mean_mae = results_df["mae"].mean()
mean_rmse = results_df["rmse"].mean()
mean_r2 = results_df["r2"].mean()


print("\n")
print("=" * 60)
print("OVERALL SPATIAL PERFORMANCE")
print("=" * 60)

print(f"Mean MAE  : {mean_mae:.4f} °C")
print(f"Mean RMSE : {mean_rmse:.4f} °C")
print(f"Mean R²   : {mean_r2:.4f}")


# ==================================================
# 7. Best and worst blocks
# ==================================================

best_block = results_df.loc[
    results_df["r2"].idxmax()
]

worst_block = results_df.loc[
    results_df["r2"].idxmin()
]


print("\nBest spatial block:")

print(
    f"Block={best_block['block']}, "
    f"Samples={int(best_block['samples'])}, "
    f"MAE={best_block['mae']:.4f} °C, "
    f"RMSE={best_block['rmse']:.4f} °C, "
    f"R²={best_block['r2']:.4f}"
)


print("\nWorst spatial block:")

print(
    f"Block={worst_block['block']}, "
    f"Samples={int(worst_block['samples'])}, "
    f"MAE={worst_block['mae']:.4f} °C, "
    f"RMSE={worst_block['rmse']:.4f} °C, "
    f"R²={worst_block['r2']:.4f}"
)


# ==================================================
# 8. Save validation results
# ==================================================

OUTPUT = "ml/models/spatial_validation_results.csv"

results_df.to_csv(
    OUTPUT,
    index=False
)

print(f"\nResults saved:")
print(OUTPUT)