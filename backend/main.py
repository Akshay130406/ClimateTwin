from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.map import router as map_router
from backend.routes.simulator import router as simulator_router
from backend.routes.vulnerability import router as vulnerability_router
from backend.routes.intervention import router as intervention_router
from backend.routes.optimizer import router as optimizer_router
from backend.routes.future_impact import router as future_impact_router
from backend.routes.ai_agent import router as ai_agent_router
from backend.routes.infrastructure import router as infrastructure_router


app = FastAPI(
    title="ClimateTwin API",
    description="AI-Powered Urban Climate Decision Engine",
    version="0.1.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "https://climate-twin-azure.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API Routes
# ============================================================

app.include_router(map_router)
app.include_router(simulator_router)
app.include_router(vulnerability_router)
app.include_router(intervention_router)
app.include_router(optimizer_router)
app.include_router(future_impact_router)
app.include_router(ai_agent_router)
app.include_router(infrastructure_router)


# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
def root():
    return {
        "project": "ClimateTwin",
        "status": "running",
        "message": "ClimateTwin backend is working!",
    }


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }