from fastapi import APIRouter
from pydantic import BaseModel

from optimizer.intervention_optimizer import optimize_interventions

router = APIRouter()


class OptimizerRequest(BaseModel):
    budget: float = 5000


@router.post("/optimize")
def optimize_climate_interventions(request: OptimizerRequest):

    result = optimize_interventions(
        budget=request.budget,
        step=10
    )

    return result