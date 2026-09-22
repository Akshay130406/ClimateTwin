from intervention import (
    load_intervention_data,
    apply_intervention,
    calculate_intervention_summary,
)


# Load Pune data
gdf = load_intervention_data()

print("Loaded cells:", len(gdf))


# Test intervention scenario
result = apply_intervention(
    gdf,
    tree_plantation=50,
    cool_roof=40,
    green_roof=30,
    urban_parks=20,
    reflective_roads=30,
    green_corridors=20,
)


# Calculate summary
summary = calculate_intervention_summary(result)


print("\nIntervention Summary")
print("--------------------")

for key, value in summary.items():
    print(f"{key}: {value}")


# Show sample cells
print("\nSample Results")
print("--------------")

print(
    result[
        [
            "cell_id",
            "baseline_lst",
            "intervention_lst",
            "lst_reduction",
            "baseline_risk",
            "intervention_risk",
        ]
    ]
    .head(10)
    .to_string(index=False)
)