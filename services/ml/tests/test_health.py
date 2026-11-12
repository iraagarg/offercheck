import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_health_is_ok(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("RAILWAY_GIT_COMMIT_SHA", raising=False)
    monkeypatch.delenv("GIT_SHA", raising=False)
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "dev"}


def test_version_uses_the_deploy_commit(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("RAILWAY_GIT_COMMIT_SHA", "0123456789abcdef0123")
    response = TestClient(app).get("/health")
    assert response.json()["version"] == "0123456789ab"


def test_unknown_route_is_404() -> None:
    assert TestClient(app).get("/nope").status_code == 404


def test_api_docs_are_not_exposed() -> None:
    assert TestClient(app).get("/docs").status_code == 404
