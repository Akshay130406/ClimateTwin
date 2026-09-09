from fastapi import FastAPI

app = FastAPI(
    title="ClimateTwin API",
    description="AI-Powered Urban Climate Decision Engine",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "project": "ClimateTwin",
        "status": "running",
        "message": "ClimateTwin backend is working!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }