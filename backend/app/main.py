
from fastapi import FastAPI

app = FastAPI(
    title="V.I.S.I.O.N. API",
    description="Invoice verification and operational review API",
    version="0.1.0",
)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "vision-api",
    }


@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "Welcome to the V.I.S.I.O.N. API",
        "docs": "/docs",
    }

