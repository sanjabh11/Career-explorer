import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ...scripts.api.v2.activity_integration import router
from ...scripts.models.activity_integration import MentalProcess, PerformanceMetric
from ...scripts.database import get_db

client = TestClient(router)

@pytest.fixture
def db_session():
    # Create test database session
    session = Session()
    yield session
    session.close()

@pytest.fixture
def sample_mental_process():
    return {
        "process_name": "Strategic Analysis",
        "description": "Analyzing complex business scenarios",
        "importance": 8.5,
        "frequency": 7.0,
        "complexity": 9.0,
        "skills_required": [
            {"skill": "Critical Thinking", "level": 9.0},
            {"skill": "Data Analysis", "level": 8.0}
        ],
        "development_time": "6-12 months"
    }

@pytest.fixture
def sample_performance_metric():
    return {
        "metric_name": "Project Completion Rate",
        "description": "Rate of successful project completions",
        "target_value": 95.0,
        "unit": "%",
        "importance": 9.0,
        "current_value": 87.5,
        "historical_data": [
            {"period": "2023-Q1", "value": 85.0},
            {"period": "2023-Q2", "value": 87.5}
        ],
        "benchmarks": {
            "industry_average": 80.0,
            "top_performers": 95.0
        }
    }

def test_create_mental_process(db_session, sample_mental_process):
    response = client.post(
        "/mental-processes/test-role-1",
        json=sample_mental_process
    )
    assert response.status_code == 200
    data = response.json()
    assert data["process_name"] == sample_mental_process["process_name"]
    assert data["importance"] == sample_mental_process["importance"]

def test_get_mental_processes(db_session):
    response = client.get("/mental-processes/test-role-1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_mental_processes_with_min_importance(db_session):
    response = client.get("/mental-processes/test-role-1?min_importance=8.0")
    assert response.status_code == 200
    data = response.json()
    assert all(process["importance"] >= 8.0 for process in data)

def test_create_performance_metric(db_session, sample_performance_metric):
    response = client.post(
        "/performance-metrics/test-role-1",
        json=sample_performance_metric
    )
    assert response.status_code == 200
    data = response.json()
    assert data["metric_name"] == sample_performance_metric["metric_name"]
    assert data["target_value"] == sample_performance_metric["target_value"]

def test_get_performance_metrics(db_session):
    response = client.get("/performance-metrics/test-role-1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_comprehensive_analysis(db_session):
    response = client.get("/analysis/comprehensive/test-role-1")
    assert response.status_code == 200
    data = response.json()
    assert "mental_processes" in data
    assert "performance_metrics" in data

def test_get_skill_requirements(db_session):
    response = client.get("/analysis/skill-requirements/test-role-1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    for skill in data.values():
        assert "average_importance" in skill
        assert "processes" in skill

def test_invalid_role_id():
    response = client.get("/mental-processes/invalid-role")
    assert response.status_code == 404

def test_invalid_importance_value(db_session, sample_mental_process):
    invalid_process = sample_mental_process.copy()
    invalid_process["importance"] = 11.0  # Should be between 0 and 10
    response = client.post(
        "/mental-processes/test-role-1",
        json=invalid_process
    )
    assert response.status_code == 422

def test_missing_required_fields(db_session):
    incomplete_metric = {
        "metric_name": "Incomplete Metric",
        "importance": 8.0
    }
    response = client.post(
        "/performance-metrics/test-role-1",
        json=incomplete_metric
    )
    assert response.status_code == 422
