import os
import sys
import pathlib

# Point at an isolated on-disk SQLite file instead of the real RDS DATABASE_URL, so
# running the test suite never mutates the shared demo database.
_TEST_DB_PATH = pathlib.Path(__file__).parent / "_test.db"
if _TEST_DB_PATH.exists():
    _TEST_DB_PATH.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"

sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def _session_client():
    with TestClient(app) as c:
        yield c
    if _TEST_DB_PATH.exists():
        _TEST_DB_PATH.unlink()


@pytest.fixture()
def client(_session_client):
    # Every test starts from a freshly reseeded, known-good demo state.
    _session_client.post("/api/demo/reset")
    return _session_client
