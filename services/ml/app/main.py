"""OfferCheck ML service.

Phase 1: only the health endpoint. Text extraction (/extract) and the
classifier (/classify) are added in Phase 3.
"""

import os
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    version: str


def app_version() -> str:
    # Railway sets RAILWAY_GIT_COMMIT_SHA on deploys; GIT_SHA can be set elsewhere.
    sha = os.environ.get("RAILWAY_GIT_COMMIT_SHA") or os.environ.get("GIT_SHA") or "dev"
    return sha[:12]


app = FastAPI(title="OfferCheck ML service", docs_url=None, redoc_url=None)


@app.get("/health")
def health() -> HealthResponse:
    return HealthResponse(status="ok", version=app_version())
