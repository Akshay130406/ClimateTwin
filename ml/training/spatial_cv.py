import geopandas as gpd
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==================================================
# ClimateTwin - Spatial Cross Validation
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

N_SPLITS = 5


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
y = gdf[TARGET].copy()


print("\nFeatures:")

for feature in FEATURES:
    print(f"  - {feature}")

print(f"\nTarget: {TARGET}")


print("\nMissing values:")

print(X.isnull().sum())

print(f"\nTarget missing values: {y.isnull().sum()}")


# ==================================================
# 3. Create spatial groups
# ==================================================

print("\nCreating spatial groups...")

# Project to UTM Zone 43N
gdf_projected = gdf.to_crs(epsg=32643)

# Calculate cell centroids
centroids = gdf_projected.geometry.centroid

x_coord = centroids.x
y_coord = centroids.y


# Create a 5 x 5 geographic grid
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


# Combine coordinates to create group IDs
gdf["spatial_group"] = (
    gdf["spatial_x"].astype(str)
    + "_"
    + gdf["spatial_y"].astype(str)
)


groups = gdf["spatial_group"].values

print(
    f"Spatial groups created: "
    f"{gdf['spatial_group'].nunique()}"
)


# ==================================================
# 4. GroupKFold
# ==================================================

print("\nStarting spatial cross-validation...")

gkf = GroupKFold(n_splits=N_SPLITS)


# Store all out-of-fold predictions
all_actual = []
all_predictions = []

fold_results = []


# ==================================================
# 5. Train and validate
# ==================================================

for fold, (train_idx, test_idx) in enumerate(
    gkf.split(X, y, groups=groups),
    start=1
):

    print("\n" + "=" * 50)
    print(f"FOLD {fold}")
    print("=" * 50)

    X_train = X.iloc[train_idx]
    X_test = X.iloc[test_idx]

    y_train = y.iloc[train_idx]
    y_test = y.iloc[test_idx]


    print(f"Train samples: {len(X_train)}")
    print(f"Test samples : {len(X_test)}")


    # --------------------------------------------------
    # Random Forest
    # --------------------------------------------------

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1
    )


    print("Training model...")

    model.fit(X_train, y_train)


    # --------------------------------------------------
    # Predictions
    # --------------------------------------------------

    predictions = model.predict(X_test)


    # --------------------------------------------------
    # Fold metrics
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


    fold_results.append({
        "fold": fold,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "mae": mae,
        "rmse": rmse,
        "r2": r2
    })


    # Store predictions
    all_actual.extend(y_test.tolist())
    all_predictions.extend(predictions.tolist())


# ==================================================
# 6. Overall out-of-fold performance
# ==================================================

all_actual = np.array(all_actual)
all_predictions = np.array(all_predictions)


overall_mae = mean_absolute_error(
    all_actual,
    all_predictions
)

overall_rmse = np.sqrt(
    mean_squared_error(
        all_actual,
        all_predictions
    )
)

overall_r2 = r2_score(
    all_actual,
    all_predictions
)


# ==================================================
# 7. Display final results
# ==================================================

results_df = pd.DataFrame(fold_results)


print("\n\n")
print("=" * 60)
print("SPATIAL CROSS-VALIDATION RESULTS")
print("=" * 60)


print("\nFold Results:")

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}"
    )
)


print("\n")
print("=" * 60)
print("OVERALL OUT-OF-FOLD PERFORMANCE")
print("=" * 60)

print(f"MAE  : {overall_mae:.4f} °C")
print(f"RMSE : {overall_rmse:.4f} °C")
print(f"R²   : {overall_r2:.4f}")


# ==================================================
# 8. Average fold metrics
# ==================================================

print("\n")
print("=" * 60)
print("AVERAGE FOLD PERFORMANCE")
print("=" * 60)

print(
    f"Mean MAE  : {results_df['mae'].mean():.4f} °C"
)

print(
    f"Mean RMSE : {results_df['rmse'].mean():.4f} °C"
)

print(
    f"Mean R²   : {results_df['r2'].mean():.4f}"
)


# ==================================================
# 9. Save results
# ==================================================

OUTPUT = "ml/models/spatial_cv_results.csv"

results_df.to_csv(
    OUTPUT,
    index=False
)


# Save out-of-fold predictions
predictions_df = pd.DataFrame({
    "actual_lst": all_actual,
    "predicted_lst": all_predictions
})

PREDICTIONS_OUTPUT = "ml/models/spatial_cv_predictions.csv"

predictions_df.to_csv(
    PREDICTIONS_OUTPUT,
    index=False
)


print("\nResults saved:")
print(OUTPUT)

print("\nPredictions saved:")
print(PREDICTIONS_OUTPUT)


# ==================================================
# 10. Final interpretation
# ==================================================

print("\n")
print("=" * 60)
print("MODEL VALIDATION SUMMARY")
print("=" * 60)

if overall_r2 >= 0.70:
    print("Strong spatial generalization.")

elif overall_r2 >= 0.50:
    print("Moderate spatial generalization.")

elif overall_r2 >= 0.30:
    print("Weak-to-moderate spatial generalization.")

else:
    print("Weak spatial generalization. Feature/model improvement recommended.")