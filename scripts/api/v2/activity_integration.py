from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ...database import get_db
from ...models.activity_integration import (
    MentalProcess,
    PerformanceMetric,
    CollaborationRequirement
)

router = APIRouter(prefix="/api/v2/activity-integration", tags=["activity-integration"])

# Pydantic models
class SkillRequirement(BaseModel):
    skill: str
    level: float = Field(..., ge=0, le=10)

class MentalProcessBase(BaseModel):
    process_name: str
    description: str
    importance: float = Field(..., ge=0, le=10)
    frequency: float = Field(..., ge=0, le=10)
    complexity: float = Field(..., ge=0, le=10)
    skills_required: List[SkillRequirement]
    development_time: str

class PerformanceMetricBase(BaseModel):
    metric_name: str
    description: str
    target_value: float
    unit: str
    importance: float = Field(..., ge=0, le=10)
    current_value: Optional[float]
    historical_data: List[dict]
    benchmarks: dict

# Mental Process endpoints
@router.get("/mental-processes/{role_id}")
async def get_mental_processes(
    role_id: str,
    min_importance: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MentalProcess).filter(MentalProcess.role_id == role_id)
    if min_importance:
        query = query.filter(MentalProcess.importance >= min_importance)
    return query.all()

@router.post("/mental-processes/{role_id}")
async def create_mental_process(
    role_id: str,
    process: MentalProcessBase,
    db: Session = Depends(get_db)
):
    db_process = MentalProcess(**process.dict(), role_id=role_id)
    db.add(db_process)
    db.commit()
    db.refresh(db_process)
    return db_process

# Performance Metrics endpoints
@router.get("/performance-metrics/{role_id}")
async def get_performance_metrics(
    role_id: str,
    metric_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PerformanceMetric).filter(PerformanceMetric.role_id == role_id)
    if metric_type:
        query = query.filter(PerformanceMetric.metric_type == metric_type)
    return query.all()

@router.post("/performance-metrics/{role_id}")
async def create_performance_metric(
    role_id: str,
    metric: PerformanceMetricBase,
    db: Session = Depends(get_db)
):
    db_metric = PerformanceMetric(**metric.dict(), role_id=role_id)
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

# Aggregated analysis endpoints
@router.get("/analysis/comprehensive/{role_id}")
async def get_comprehensive_analysis(
    role_id: str,
    db: Session = Depends(get_db)
):
    """Get comprehensive activity analysis including mental processes and performance metrics"""
    processes = db.query(MentalProcess).filter(
        MentalProcess.role_id == role_id
    ).all()

    metrics = db.query(PerformanceMetric).filter(
        PerformanceMetric.role_id == role_id
    ).all()

    return {
        "mental_processes": processes,
        "performance_metrics": metrics
    }

@router.get("/analysis/skill-requirements/{role_id}")
async def get_skill_requirements(
    role_id: str,
    min_importance: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get aggregated skill requirements across all mental processes"""
    processes = db.query(MentalProcess).filter(
        MentalProcess.role_id == role_id
    )
    if min_importance:
        processes = processes.filter(MentalProcess.importance >= min_importance)
    
    skill_requirements = {}
    for process in processes:
        for skill in process.skills_required:
            if skill.skill not in skill_requirements:
                skill_requirements[skill.skill] = {
                    "importance": [],
                    "processes": []
                }
            skill_requirements[skill.skill]["importance"].append(skill.level)
            skill_requirements[skill.skill]["processes"].append(process.process_name)
    
    # Calculate average importance for each skill
    for skill in skill_requirements:
        skill_requirements[skill]["average_importance"] = (
            sum(skill_requirements[skill]["importance"]) / 
            len(skill_requirements[skill]["importance"])
        )
    
    return skill_requirements
