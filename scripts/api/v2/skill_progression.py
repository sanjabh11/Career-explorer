from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ...database import get_db
from ...models.skill_progression import (
    Skill,
    LearningPath,
    LearningResource,
    ProgressTracking,
    SkillAssessment,
    skill_dependencies
)

router = APIRouter(prefix="/api/v2/skill-progression", tags=["skill-progression"])

# Pydantic models
class SkillBase(BaseModel):
    name: str
    category: str
    description: str
    proficiency_levels: List[dict]
    learning_duration: dict
    assessment_criteria: List[dict]
    industry_relevance: dict
    future_outlook: dict

class LearningPathBase(BaseModel):
    name: str
    description: str
    difficulty_level: int = Field(..., ge=1, le=10)
    estimated_duration: int
    target_role: str
    prerequisites: List[dict]
    learning_objectives: List[dict]
    industry_alignment: List[dict]
    career_impact: dict

class LearningResourceBase(BaseModel):
    title: str
    type: str
    provider: str
    format: str
    duration: int
    difficulty_level: int = Field(..., ge=1, le=10)
    cost: float
    url: str
    prerequisites: List[dict]
    learning_objectives: List[dict]
    content_outline: List[dict]

class ProgressTrackingBase(BaseModel):
    current_level: int
    target_level: int
    progress_percentage: float = Field(..., ge=0, le=100)
    time_spent: int
    completed_resources: List[dict]
    assessment_results: List[dict]
    milestones_achieved: List[dict]
    next_steps: List[dict]
    learning_pace: float
    strengths: List[dict]
    areas_for_improvement: List[dict]

class SkillAssessmentBase(BaseModel):
    name: str
    description: str
    assessment_type: str
    difficulty_level: int = Field(..., ge=1, le=10)
    duration: int
    passing_score: float
    questions: List[dict]
    rubric: dict
    prerequisites: List[dict]
    certification: dict
    validity_period: int

# Skill endpoints
@router.get("/skills")
async def get_skills(
    category: Optional[str] = None,
    min_relevance: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Skill)
    if category:
        query = query.filter(Skill.category == category)
    # Additional filtering can be applied based on industry_relevance
    return query.all()

@router.get("/skills/{skill_id}")
async def get_skill(
    skill_id: int,
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill

@router.post("/skills")
async def create_skill(
    skill: SkillBase,
    db: Session = Depends(get_db)
):
    db_skill = Skill(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

# Learning path endpoints
@router.get("/learning-paths")
async def get_learning_paths(
    target_role: Optional[str] = None,
    max_difficulty: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LearningPath)
    if target_role:
        query = query.filter(LearningPath.target_role == target_role)
    if max_difficulty:
        query = query.filter(LearningPath.difficulty_level <= max_difficulty)
    return query.all()

@router.post("/learning-paths")
async def create_learning_path(
    path: LearningPathBase,
    db: Session = Depends(get_db)
):
    db_path = LearningPath(**path.dict())
    db.add(db_path)
    db.commit()
    db.refresh(db_path)
    return db_path

# Learning resource endpoints
@router.get("/resources")
async def get_learning_resources(
    skill_id: int,
    max_difficulty: Optional[int] = None,
    format_type: Optional[str] = None,
    max_cost: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LearningResource).filter(
        LearningResource.skill_id == skill_id
    )
    if max_difficulty:
        query = query.filter(LearningResource.difficulty_level <= max_difficulty)
    if format_type:
        query = query.filter(LearningResource.format == format_type)
    if max_cost:
        query = query.filter(LearningResource.cost <= max_cost)
    return query.all()

@router.post("/resources/{skill_id}")
async def create_learning_resource(
    skill_id: int,
    resource: LearningResourceBase,
    db: Session = Depends(get_db)
):
    db_resource = LearningResource(skill_id=skill_id, **resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

# Progress tracking endpoints
@router.get("/progress/{user_id}")
async def get_user_progress(
    user_id: str,
    skill_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProgressTracking).filter(
        ProgressTracking.user_id == user_id
    )
    if skill_id:
        query = query.filter(ProgressTracking.skill_id == skill_id)
    return query.all()

@router.post("/progress/{user_id}/{skill_id}")
async def update_progress(
    user_id: str,
    skill_id: int,
    progress: ProgressTrackingBase,
    db: Session = Depends(get_db)
):
    db_progress = ProgressTracking(
        user_id=user_id,
        skill_id=skill_id,
        **progress.dict()
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

# Assessment endpoints
@router.get("/assessments/{skill_id}")
async def get_skill_assessments(
    skill_id: int,
    difficulty_level: Optional[int] = None,
    assessment_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SkillAssessment).filter(
        SkillAssessment.skill_id == skill_id
    )
    if difficulty_level:
        query = query.filter(SkillAssessment.difficulty_level <= difficulty_level)
    if assessment_type:
        query = query.filter(SkillAssessment.assessment_type == assessment_type)
    return query.all()

@router.post("/assessments/{skill_id}")
async def create_assessment(
    skill_id: int,
    assessment: SkillAssessmentBase,
    db: Session = Depends(get_db)
):
    db_assessment = SkillAssessment(
        skill_id=skill_id,
        **assessment.dict()
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

# Skill dependency endpoints
@router.get("/dependencies/{skill_id}")
async def get_skill_dependencies(
    skill_id: int,
    dependency_type: Optional[str] = None,
    min_strength: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get prerequisites for a skill"""
    query = db.query(skill_dependencies).filter(
        skill_dependencies.c.dependent_skill_id == skill_id
    )
    if dependency_type:
        query = query.filter(skill_dependencies.c.dependency_type == dependency_type)
    if min_strength:
        query = query.filter(skill_dependencies.c.strength >= min_strength)
    return query.all()

@router.post("/dependencies/{prerequisite_id}/{dependent_id}")
async def create_dependency(
    prerequisite_id: int,
    dependent_id: int,
    dependency_type: str,
    strength: int = Field(..., ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Create a prerequisite relationship between skills"""
    db.execute(
        skill_dependencies.insert().values(
            prerequisite_skill_id=prerequisite_id,
            dependent_skill_id=dependent_id,
            dependency_type=dependency_type,
            strength=strength,
            created_at=datetime.utcnow()
        )
    )
    db.commit()
    return {"status": "success"}
