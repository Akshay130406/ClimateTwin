from fastapi import APIRouter, HTTPException
from infrastructure_planner.infrastructure_planner import (
    recommend_location,
    rank_candidate_locations,
)

router = APIRouter()


@router.get("/infrastructure/recommend")
def get_infrastructure_recommendation(
    project_type: str = "Highway"
):
    allowed_types = [
        "Highway",
        "Flyover",
        "Bridge",
    ]

    if project_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid project type. "
                f"Choose from: {allowed_types}"
            ),
        )

    try:
        return recommend_location(project_type)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@router.get("/infrastructure/candidates")
def get_infrastructure_candidates(
    project_type: str = "Highway",
    limit: int = 10,
):
    allowed_types = [
        "Highway",
        "Flyover",
        "Bridge",
    ]

    if project_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid project type. "
                f"Choose from: {allowed_types}"
            ),
        )

    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 50.",
        )

    try:
        candidates = rank_candidate_locations(
            project_type=project_type,
            limit=limit,
        )

        return candidates.to_dict(
            orient="records"
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )