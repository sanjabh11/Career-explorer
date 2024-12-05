from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ...database import get_db
from ...models.automation_analysis import (
    TaskAutomation,
    TechnologyFactor,
    AdaptationRequirement
)

router = APIRouter(prefix="/api/v2/automation-analysis", tags=["automation-analysis"])

# Pydantic models
class TechnologyFactorBase(BaseModel):
    technology: str
    impact: float = Field(..., ge=0, le=10)
    maturity: float = Field(..., ge=0, le=1)
    adoption_rate: float = Field(..., ge=0, le=1)

class AdaptationRequirementBase(BaseModel):
    skill: str
    importance: float = Field(..., ge=0, le=10)
    development_time: str

class TaskAutomationBase(BaseModel):
    task_name: str
    description: str
    automation_probability: float = Field(..., ge=0, le=1)
    timeline: str
    impact_level: float = Field(..., ge=0, le=10)
    required_adaptations: List[AdaptationRequirementBase]
    technology_factors: List[TechnologyFactorBase]

# Task Automation endpoints
@router.get("/tasks/{role_id}")
async def get_automation_tasks(
    role_id: str,
    min_probability: Optional[float] = None,
    min_impact: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TaskAutomation).filter(TaskAutomation.role_id == role_id)
    if min_probability:
        query = query.filter(TaskAutomation.automation_probability >= min_probability)
    if min_impact:
        query = query.filter(TaskAutomation.impact_level >= min_impact)
    return query.all()

@router.post("/tasks/{role_id}")
async def create_automation_task(
    role_id: str,
    task: TaskAutomationBase,
    db: Session = Depends(get_db)
):
    db_task = TaskAutomation(**task.dict(), role_id=role_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# Analysis endpoints
@router.get("/analysis/risk-assessment/{role_id}")
async def get_risk_assessment(
    role_id: str,
    timeline: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get comprehensive automation risk assessment"""
    tasks = db.query(TaskAutomation).filter(
        TaskAutomation.role_id == role_id
    )
    if timeline:
        tasks = tasks.filter(TaskAutomation.timeline == timeline)
    
    tasks = tasks.all()
    
    # Calculate overall risk metrics
    total_tasks = len(tasks)
    if total_tasks == 0:
        raise HTTPException(status_code=404, detail="No tasks found for role")
    
    high_risk_tasks = sum(1 for task in tasks if task.automation_probability > 0.7)
    medium_risk_tasks = sum(1 for task in tasks if 0.3 <= task.automation_probability <= 0.7)
    low_risk_tasks = sum(1 for task in tasks if task.automation_probability < 0.3)
    
    # Aggregate required adaptations
    adaptation_requirements = {}
    for task in tasks:
        for adaptation in task.required_adaptations:
            if adaptation.skill not in adaptation_requirements:
                adaptation_requirements[adaptation.skill] = {
                    "importance": [],
                    "tasks": []
                }
            adaptation_requirements[adaptation.skill]["importance"].append(adaptation.importance)
            adaptation_requirements[adaptation.skill]["tasks"].append(task.task_name)
    
    # Calculate average importance for each adaptation
    for skill in adaptation_requirements:
        adaptation_requirements[skill]["average_importance"] = (
            sum(adaptation_requirements[skill]["importance"]) / 
            len(adaptation_requirements[skill]["importance"])
        )
    
    # Analyze technology factors
    technology_impact = {}
    for task in tasks:
        for tech in task.technology_factors:
            if tech.technology not in technology_impact:
                technology_impact[tech.technology] = {
                    "impact": [],
                    "maturity": [],
                    "adoption_rate": [],
                    "tasks": []
                }
            technology_impact[tech.technology]["impact"].append(tech.impact)
            technology_impact[tech.technology]["maturity"].append(tech.maturity)
            technology_impact[tech.technology]["adoption_rate"].append(tech.adoption_rate)
            technology_impact[tech.technology]["tasks"].append(task.task_name)
    
    # Calculate averages for technology impacts
    for tech in technology_impact:
        technology_impact[tech]["average_impact"] = (
            sum(technology_impact[tech]["impact"]) / 
            len(technology_impact[tech]["impact"])
        )
        technology_impact[tech]["average_maturity"] = (
            sum(technology_impact[tech]["maturity"]) / 
            len(technology_impact[tech]["maturity"])
        )
        technology_impact[tech]["average_adoption"] = (
            sum(technology_impact[tech]["adoption_rate"]) / 
            len(technology_impact[tech]["adoption_rate"])
        )
    
    return {
        "risk_distribution": {
            "high_risk": high_risk_tasks / total_tasks,
            "medium_risk": medium_risk_tasks / total_tasks,
            "low_risk": low_risk_tasks / total_tasks
        },
        "task_count": {
            "total": total_tasks,
            "high_risk": high_risk_tasks,
            "medium_risk": medium_risk_tasks,
            "low_risk": low_risk_tasks
        },
        "adaptation_requirements": adaptation_requirements,
        "technology_impact": technology_impact
    }

@router.get("/analysis/timeline-projection/{role_id}")
async def get_timeline_projection(
    role_id: str,
    db: Session = Depends(get_db)
):
    """Get automation timeline projections"""
    tasks = db.query(TaskAutomation).filter(
        TaskAutomation.role_id == role_id
    ).all()
    
    timeline_data = {}
    for task in tasks:
        if task.timeline not in timeline_data:
            timeline_data[task.timeline] = {
                "tasks": [],
                "average_probability": [],
                "average_impact": []
            }
        timeline_data[task.timeline]["tasks"].append(task.task_name)
        timeline_data[task.timeline]["average_probability"].append(task.automation_probability)
        timeline_data[task.timeline]["average_impact"].append(task.impact_level)
    
    # Calculate averages for each timeline
    for timeline in timeline_data:
        timeline_data[timeline]["average_probability"] = (
            sum(timeline_data[timeline]["average_probability"]) / 
            len(timeline_data[timeline]["average_probability"])
        )
        timeline_data[timeline]["average_impact"] = (
            sum(timeline_data[timeline]["average_impact"]) / 
            len(timeline_data[timeline]["average_impact"])
        )
    
    return timeline_data
