import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ...scripts.api.v2.automation_analysis import router
from ...scripts.models.automation_analysis import TaskAutomation
from ...scripts.database import get_db

client = TestClient(router)

@pytest.fixture
def db_session():
    # Create test database session
    session = Session()
    yield session
    session.close()

@pytest.fixture
def sample_automation_task():
    return {
        "task_name": "Data Entry",
        "description": "Manual data entry and validation",
        "automation_probability": 0.85,
        "timeline": "1-2 years",
        "impact_level": 7.5,
        "required_adaptations": [
            {
                "skill": "Data Analysis",
                "importance": 8.0,
                "development_time": "3-6 months"
            },
            {
                "skill": "Process Automation",
                "importance": 9.0,
                "development_time": "6-12 months"
            }
        ],
        "technology_factors": [
            {
                "technology": "RPA",
                "impact": 9.0,
                "maturity": 0.8,
                "adoption_rate": 0.6
            },
            {
                "technology": "Machine Learning",
                "impact": 7.0,
                "maturity": 0.7,
                "adoption_rate": 0.4
            }
        ]
    }

def test_create_automation_task(db_session, sample_automation_task):
    response = client.post(
        "/tasks/test-role-1",
        json=sample_automation_task
    )
    assert response.status_code == 200
    data = response.json()
    assert data["task_name"] == sample_automation_task["task_name"]
    assert data["automation_probability"] == sample_automation_task["automation_probability"]

def test_get_automation_tasks(db_session):
    response = client.get("/tasks/test-role-1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_automation_tasks_with_min_probability(db_session):
    response = client.get("/tasks/test-role-1?min_probability=0.7")
    assert response.status_code == 200
    data = response.json()
    assert all(task["automation_probability"] >= 0.7 for task in data)

def test_get_risk_assessment(db_session):
    response = client.get("/analysis/risk-assessment/test-role-1")
    assert response.status_code == 200
    data = response.json()
    assert "risk_distribution" in data
    assert "task_count" in data
    assert "adaptation_requirements" in data
    assert "technology_impact" in data

def test_get_risk_assessment_with_timeline(db_session):
    response = client.get("/analysis/risk-assessment/test-role-1?timeline=1-2 years")
    assert response.status_code == 200
    data = response.json()
    assert "risk_distribution" in data

def test_get_timeline_projection(db_session):
    response = client.get("/analysis/timeline-projection/test-role-1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    for timeline in data.values():
        assert "tasks" in timeline
        assert "average_probability" in timeline
        assert "average_impact" in timeline

def test_invalid_probability_value(db_session, sample_automation_task):
    invalid_task = sample_automation_task.copy()
    invalid_task["automation_probability"] = 1.5  # Should be between 0 and 1
    response = client.post(
        "/tasks/test-role-1",
        json=invalid_task
    )
    assert response.status_code == 422

def test_invalid_impact_value(db_session, sample_automation_task):
    invalid_task = sample_automation_task.copy()
    invalid_task["impact_level"] = 11.0  # Should be between 0 and 10
    response = client.post(
        "/tasks/test-role-1",
        json=invalid_task
    )
    assert response.status_code == 422

def test_missing_required_fields(db_session):
    incomplete_task = {
        "task_name": "Incomplete Task",
        "automation_probability": 0.8
    }
    response = client.post(
        "/tasks/test-role-1",
        json=incomplete_task
    )
    assert response.status_code == 422

def test_get_nonexistent_role(db_session):
    response = client.get("/tasks/nonexistent-role")
    assert response.status_code == 404

def test_technology_factor_validation(db_session, sample_automation_task):
    invalid_task = sample_automation_task.copy()
    invalid_task["technology_factors"][0]["maturity"] = 1.5  # Should be between 0 and 1
    response = client.post(
        "/tasks/test-role-1",
        json=invalid_task
    )
    assert response.status_code == 422
