from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ...database import get_db
from ...models.work_context import (
    WorkEnvironment,
    ActivityMetrics,
    SafetyRequirements,
    RemoteWorkMetrics
)

router = APIRouter(prefix="/api/v2/work-context", tags=["work-context"])

# Pydantic models for request/response
class WorkEnvironmentBase(BaseModel):
    indoor_percentage: int = Field(..., ge=0, le=100)
    outdoor_percentage: int = Field(..., ge=0, le=100)
    temperature_controlled: bool
    noise_level: int = Field(..., ge=1, le=10)
    lighting_conditions: str
    workspace_type: str
    required_equipment: List[dict]
    technology_tools: List[dict]
    protective_equipment: List[dict]
    workspace_requirements: dict
    standing_percentage: int = Field(..., ge=0, le=100)
    sitting_percentage: int = Field(..., ge=0, le=100)
    walking_percentage: int = Field(..., ge=0, le=100)
    lifting_requirements: dict
    physical_activities: List[dict]
    hazard_exposure: List[dict]
    environmental_risks: List[dict]
    weather_exposure: bool

class ActivityMetricsBase(BaseModel):
    daily_tasks: List[dict]
    time_allocation: dict
    work_schedule: dict
    breaks_pattern: dict
    team_interaction: int = Field(..., ge=1, le=10)
    client_interaction: int = Field(..., ge=1, le=10)
    public_interaction: int = Field(..., ge=1, le=10)
    remote_collaboration: int = Field(..., ge=1, le=10)
    task_variety: int = Field(..., ge=1, le=10)
    task_complexity: int = Field(..., ge=1, le=10)
    decision_making_freq: int = Field(..., ge=1, le=10)
    problem_solving_req: int = Field(..., ge=1, le=10)
    deadline_frequency: int = Field(..., ge=1, le=10)
    multitasking_req: int = Field(..., ge=1, le=10)
    autonomy_level: int = Field(..., ge=1, le=10)
    teamwork_req: int = Field(..., ge=1, le=10)

class SafetyRequirementsBase(BaseModel):
    required_certifications: List[dict]
    training_frequency: dict
    safety_protocols: List[dict]
    emergency_procedures: List[dict]
    ppe_requirements: List[dict]
    safety_equipment: List[dict]
    equipment_maintenance: dict
    regulatory_standards: List[dict]
    inspection_requirements: dict
    reporting_requirements: dict
    hazard_levels: dict
    risk_mitigation: List[dict]
    incident_history: dict

class RemoteWorkMetricsBase(BaseModel):
    remote_feasibility: int = Field(..., ge=1, le=10)
    hybrid_feasibility: int = Field(..., ge=1, le=10)
    location_flexibility: int = Field(..., ge=1, le=10)
    required_technology: List[dict]
    connectivity_needs: dict
    software_requirements: List[dict]
    common_arrangements: List[dict]
    collaboration_tools: List[dict]
    communication_methods: List[dict]
    productivity_metrics: dict
    success_factors: List[dict]
    challenges: List[dict]

# Environment endpoints
@router.get("/environment/{occupation_id}")
async def get_work_environment(
    occupation_id: str,
    db: Session = Depends(get_db)
):
    environment = db.query(WorkEnvironment).filter(
        WorkEnvironment.occupation_id == occupation_id
    ).first()
    if not environment:
        raise HTTPException(status_code=404, detail="Work environment not found")
    return environment

@router.post("/environment/{occupation_id}")
async def create_work_environment(
    occupation_id: str,
    environment: WorkEnvironmentBase,
    db: Session = Depends(get_db)
):
    db_environment = WorkEnvironment(
        occupation_id=occupation_id,
        **environment.dict()
    )
    db.add(db_environment)
    db.commit()
    db.refresh(db_environment)
    return db_environment

# Activity metrics endpoints
@router.get("/activities/{occupation_id}")
async def get_activity_metrics(
    occupation_id: str,
    db: Session = Depends(get_db)
):
    metrics = db.query(ActivityMetrics).filter(
        ActivityMetrics.occupation_id == occupation_id
    ).first()
    if not metrics:
        raise HTTPException(status_code=404, detail="Activity metrics not found")
    return metrics

@router.post("/activities/{occupation_id}")
async def create_activity_metrics(
    occupation_id: str,
    metrics: ActivityMetricsBase,
    db: Session = Depends(get_db)
):
    db_metrics = ActivityMetrics(
        occupation_id=occupation_id,
        **metrics.dict()
    )
    db.add(db_metrics)
    db.commit()
    db.refresh(db_metrics)
    return db_metrics

# Safety requirements endpoints
@router.get("/safety/{occupation_id}")
async def get_safety_requirements(
    occupation_id: str,
    db: Session = Depends(get_db)
):
    safety = db.query(SafetyRequirements).filter(
        SafetyRequirements.occupation_id == occupation_id
    ).first()
    if not safety:
        raise HTTPException(status_code=404, detail="Safety requirements not found")
    return safety

@router.post("/safety/{occupation_id}")
async def create_safety_requirements(
    occupation_id: str,
    safety: SafetyRequirementsBase,
    db: Session = Depends(get_db)
):
    db_safety = SafetyRequirements(
        occupation_id=occupation_id,
        **safety.dict()
    )
    db.add(db_safety)
    db.commit()
    db.refresh(db_safety)
    return db_safety

# Remote work metrics endpoints
@router.get("/remote/{occupation_id}")
async def get_remote_work_metrics(
    occupation_id: str,
    db: Session = Depends(get_db)
):
    remote = db.query(RemoteWorkMetrics).filter(
        RemoteWorkMetrics.occupation_id == occupation_id
    ).first()
    if not remote:
        raise HTTPException(status_code=404, detail="Remote work metrics not found")
    return remote

@router.post("/remote/{occupation_id}")
async def create_remote_work_metrics(
    occupation_id: str,
    remote: RemoteWorkMetricsBase,
    db: Session = Depends(get_db)
):
    db_remote = RemoteWorkMetrics(
        occupation_id=occupation_id,
        **remote.dict()
    )
    db.add(db_remote)
    db.commit()
    db.refresh(db_remote)
    return db_remote

# Aggregated work context endpoints
@router.get("/summary/{occupation_id}")
async def get_work_context_summary(
    occupation_id: str,
    db: Session = Depends(get_db)
):
    """Get a comprehensive summary of all work context aspects"""
    environment = db.query(WorkEnvironment).filter(
        WorkEnvironment.occupation_id == occupation_id
    ).first()
    activities = db.query(ActivityMetrics).filter(
        ActivityMetrics.occupation_id == occupation_id
    ).first()
    safety = db.query(SafetyRequirements).filter(
        SafetyRequirements.occupation_id == occupation_id
    ).first()
    remote = db.query(RemoteWorkMetrics).filter(
        RemoteWorkMetrics.occupation_id == occupation_id
    ).first()

    if not all([environment, activities, safety, remote]):
        raise HTTPException(status_code=404, detail="Complete work context data not found")

    return {
        "environment": environment,
        "activities": activities,
        "safety": safety,
        "remote_work": remote
    }
