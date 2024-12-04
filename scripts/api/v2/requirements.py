from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from ...database import get_db
from ...models.enhanced_requirements import (
    EducationRequirementDetail,
    SkillFrameworkModel,
    CertificationRequirement,
    TrainingRecommendation
)

router = APIRouter(prefix="/api/v2/requirements", tags=["requirements"])

# Pydantic models for request/response
class EducationRequirementBase(BaseModel):
    degree_level: str
    field_of_study: Optional[str]
    required: bool = False
    preferred: bool = False
    importance_score: float = Field(..., ge=0, le=100)
    typical_time_to_complete: Optional[int]
    alternative_paths: Optional[List[dict]]
    recommended_institutions: Optional[List[dict]]

class SkillFrameworkBase(BaseModel):
    skill_category: str
    skill_name: str
    description: str
    proficiency_level_required: int = Field(..., ge=1, le=5)
    importance_score: float = Field(..., ge=0, le=100)
    time_to_acquire: int
    prerequisites: Optional[List[dict]]
    learning_resources: Optional[List[dict]]

class CertificationRequirementBase(BaseModel):
    certification_name: str
    provider: str
    level: str
    required: bool = False
    preferred: bool = False
    validity_period: Optional[int]
    estimated_cost: Optional[float]
    prerequisites: Optional[List[dict]]
    renewal_requirements: Optional[List[dict]]
    exam_details: Optional[dict]

class TrainingRecommendationBase(BaseModel):
    skill_id: int
    training_type: str
    provider: str
    course_name: str
    description: str
    duration: int
    cost: Optional[float]
    difficulty_level: str
    prerequisites: Optional[List[dict]]
    learning_outcomes: List[str]
    rating: Optional[float] = Field(None, ge=0, le=5)
    review_count: Optional[int] = 0
    url: str

# Education Requirements endpoints
@router.get("/education-details/{occupation_id}")
async def get_education_requirements(
    occupation_id: str,
    db: Session = Depends(get_db)
):
    requirements = db.query(EducationRequirementDetail).filter(
        EducationRequirementDetail.occupation_id == occupation_id
    ).all()
    if not requirements:
        raise HTTPException(status_code=404, detail="Education requirements not found")
    return requirements

@router.post("/education-details/{occupation_id}")
async def create_education_requirement(
    occupation_id: str,
    requirement: EducationRequirementBase,
    db: Session = Depends(get_db)
):
    db_requirement = EducationRequirementDetail(
        occupation_id=occupation_id,
        **requirement.dict()
    )
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

# Skills Framework endpoints
@router.get("/skills-framework/{occupation_id}")
async def get_skills_framework(
    occupation_id: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SkillFrameworkModel).filter(
        SkillFrameworkModel.occupation_id == occupation_id
    )
    if category:
        query = query.filter(SkillFrameworkModel.skill_category == category)
    skills = query.all()
    if not skills:
        raise HTTPException(status_code=404, detail="Skills framework not found")
    return skills

@router.post("/skills-framework/{occupation_id}")
async def create_skill_framework(
    occupation_id: str,
    skill: SkillFrameworkBase,
    db: Session = Depends(get_db)
):
    db_skill = SkillFrameworkModel(
        occupation_id=occupation_id,
        **skill.dict()
    )
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

# Certification Requirements endpoints
@router.get("/certifications/{occupation_id}")
async def get_certification_requirements(
    occupation_id: str,
    required_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(CertificationRequirement).filter(
        CertificationRequirement.occupation_id == occupation_id
    )
    if required_only:
        query = query.filter(CertificationRequirement.required == True)
    certifications = query.all()
    if not certifications:
        raise HTTPException(status_code=404, detail="Certification requirements not found")
    return certifications

@router.post("/certifications/{occupation_id}")
async def create_certification_requirement(
    occupation_id: str,
    certification: CertificationRequirementBase,
    db: Session = Depends(get_db)
):
    db_certification = CertificationRequirement(
        occupation_id=occupation_id,
        **certification.dict()
    )
    db.add(db_certification)
    db.commit()
    db.refresh(db_certification)
    return db_certification

# Training Recommendations endpoints
@router.get("/training/{occupation_id}")
async def get_training_recommendations(
    occupation_id: str,
    skill_id: Optional[int] = None,
    training_type: Optional[str] = None,
    max_cost: Optional[float] = None,
    difficulty_level: Optional[str] = None,
    min_rating: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TrainingRecommendation).filter(
        TrainingRecommendation.occupation_id == occupation_id
    )
    
    if skill_id:
        query = query.filter(TrainingRecommendation.skill_id == skill_id)
    if training_type:
        query = query.filter(TrainingRecommendation.training_type == training_type)
    if max_cost:
        query = query.filter(TrainingRecommendation.cost <= max_cost)
    if difficulty_level:
        query = query.filter(TrainingRecommendation.difficulty_level == difficulty_level)
    if min_rating:
        query = query.filter(TrainingRecommendation.rating >= min_rating)
    
    recommendations = query.all()
    if not recommendations:
        raise HTTPException(status_code=404, detail="Training recommendations not found")
    return recommendations

@router.post("/training/{occupation_id}")
async def create_training_recommendation(
    occupation_id: str,
    training: TrainingRecommendationBase,
    db: Session = Depends(get_db)
):
    db_training = TrainingRecommendation(
        occupation_id=occupation_id,
        **training.dict()
    )
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training
