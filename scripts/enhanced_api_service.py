"""
Enhanced API Service for Career Explorer
Implements new endpoints while maintaining compatibility with existing services
"""

from typing import Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from .enhanced_data_models import (
    EducationRequirementTable, TrainingProgramTable,
    CareerProgressionTable, IndustryConnectionTable,
    WorkEnvironmentTable, WorkActivityDetailTable,
    AutomationRiskTable, SkillTransitionTable
)
from .onet_technical_specs5 import OccupationTable
from .database import get_db

# Create API router with version prefix
router = APIRouter(
    prefix="/api/v2",
    tags=["enhanced"],
    responses={404: {"description": "Not found"}},
)

# Data validation schemas
from pydantic import BaseModel, Field

class EducationRequirement(BaseModel):
    required_level: int
    preferred_level: int
    field_of_study: str
    certifications: List[str]
    licenses: List[str]
    continuing_education: Dict[str, str]

class TrainingProgram(BaseModel):
    name: str
    provider: str
    duration: str
    format: str
    cost_range: str
    success_rate: float = Field(..., ge=0, le=1)

class CareerProgression(BaseModel):
    next_role: str
    typical_timeframe: str
    required_experience: float
    required_skills: List[str]
    salary_increase: float
    difficulty_level: int = Field(..., ge=1, le=10)
    success_rate: float = Field(..., ge=0, le=1)

class IndustryConnection(BaseModel):
    industry_sector: str
    relevance_score: float = Field(..., ge=0, le=1)
    growth_rate: float
    transition_difficulty: float = Field(..., ge=0, le=1)
    required_reskilling: List[str]
    market_demand: int = Field(..., ge=1, le=10)

class WorkEnvironment(BaseModel):
    physical_demands: Dict[str, float]
    environmental_conditions: Dict[str, str]
    safety_requirements: List[str]
    schedule_flexibility: int = Field(..., ge=1, le=10)
    remote_work_potential: float = Field(..., ge=0, le=1)
    collaboration_level: int = Field(..., ge=1, le=10)
    stress_level: int = Field(..., ge=1, le=10)

class WorkActivityDetail(BaseModel):
    activity_type: str
    cognitive_load: int = Field(..., ge=1, le=10)
    interpersonal_intensity: int = Field(..., ge=1, le=10)
    technical_complexity: int = Field(..., ge=1, le=10)
    autonomy_level: int = Field(..., ge=1, le=10)
    decision_making_frequency: int = Field(..., ge=1, le=10)

class AutomationRisk(BaseModel):
    overall_risk_score: float = Field(..., ge=0, le=1)
    task_automation_potential: Dict[str, float]
    technology_impact_timeline: Dict[str, str]
    required_adaptations: List[Dict[str, Union[str, float]]]
    market_stability: int = Field(..., ge=1, le=10)

class SkillTransition(BaseModel):
    current_skills: List[str]
    target_skills: List[str]
    gap_analysis: Dict[str, str]
    transition_difficulty: float = Field(..., ge=0, le=1)
    estimated_timeframe: str
    recommended_resources: List[Dict[str, str]]

# API Endpoints

@router.get("/occupation/{onet_code}/education")
async def get_education_requirements(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get detailed education requirements for an occupation"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    education = db.query(EducationRequirementTable).filter(
        EducationRequirementTable.occupation_id == occupation.id
    ).first()
    
    if not education:
        raise HTTPException(status_code=404, detail="Education requirements not found")
    
    return education

@router.get("/occupation/{onet_code}/training")
async def get_training_programs(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get available training programs for an occupation"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    education = db.query(EducationRequirementTable).filter(
        EducationRequirementTable.occupation_id == occupation.id
    ).first()
    
    if not education:
        raise HTTPException(status_code=404, detail="Education requirements not found")
    
    programs = db.query(TrainingProgramTable).filter(
        TrainingProgramTable.education_requirement_id == education.id
    ).all()
    
    return programs

@router.get("/occupation/{onet_code}/career-path")
async def get_career_progression(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get career progression paths for an occupation"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    progressions = db.query(CareerProgressionTable).filter(
        CareerProgressionTable.occupation_id == occupation.id
    ).all()
    
    return progressions

@router.get("/occupation/{onet_code}/industry")
async def get_industry_connections(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get industry connections and opportunities"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    connections = db.query(IndustryConnectionTable).filter(
        IndustryConnectionTable.occupation_id == occupation.id
    ).all()
    
    return connections

@router.get("/occupation/{onet_code}/work-environment")
async def get_work_environment(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get detailed work environment information"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    environment = db.query(WorkEnvironmentTable).filter(
        WorkEnvironmentTable.occupation_id == occupation.id
    ).first()
    
    if not environment:
        raise HTTPException(status_code=404, detail="Work environment data not found")
    
    return environment

@router.get("/occupation/{onet_code}/work-activities")
async def get_work_activities(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get detailed work activities and processes"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    activities = db.query(WorkActivityDetailTable).filter(
        WorkActivityDetailTable.occupation_id == occupation.id
    ).all()
    
    return activities

@router.get("/occupation/{onet_code}/automation-risk")
async def get_automation_risk(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get automation risk analysis"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    risk = db.query(AutomationRiskTable).filter(
        AutomationRiskTable.occupation_id == occupation.id
    ).first()
    
    if not risk:
        raise HTTPException(status_code=404, detail="Automation risk data not found")
    
    return risk

@router.get("/occupation/{onet_code}/skill-transition")
async def get_skill_transition(
    onet_code: str,
    db: Session = Depends(get_db)
):
    """Get skill transition paths and recommendations"""
    occupation = db.query(OccupationTable).filter(OccupationTable.onet_code == onet_code).first()
    if not occupation:
        raise HTTPException(status_code=404, detail="Occupation not found")
    
    transition = db.query(SkillTransitionTable).filter(
        SkillTransitionTable.occupation_id == occupation.id
    ).first()
    
    if not transition:
        raise HTTPException(status_code=404, detail="Skill transition data not found")
    
    return transition
