from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ...models.skills_framework import Skill, SkillAssessment, SkillGap, SkillMetrics
from ...database import get_db
from ...schemas.skills import (
    SkillResponse,
    SkillAssessmentCreate,
    SkillAssessmentResponse,
    SkillGapResponse,
    SkillMetricsResponse,
    SkillPathResponse
)

router = APIRouter(prefix="/api/v2/skills", tags=["skills"])

@router.get("/{role_id}", response_model=List[SkillResponse])
async def get_required_skills(role_id: int, db: Session = Depends(get_db)):
    """Get required skills for a specific role."""
    skills = db.query(Skill).join(Skill.roles).filter(
        Skill.roles.any(id=role_id)
    ).all()
    return skills

@router.get("/assessment/{user_id}/{skill_id}", response_model=SkillAssessmentResponse)
async def get_skill_assessment(
    user_id: int,
    skill_id: int,
    db: Session = Depends(get_db)
):
    """Get a user's assessment for a specific skill."""
    assessment = db.query(SkillAssessment).filter(
        SkillAssessment.user_id == user_id,
        SkillAssessment.skill_id == skill_id
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.post("/assessment", response_model=SkillAssessmentResponse)
async def create_skill_assessment(
    assessment: SkillAssessmentCreate,
    db: Session = Depends(get_db)
):
    """Create or update a skill assessment."""
    existing = db.query(SkillAssessment).filter(
        SkillAssessment.user_id == assessment.user_id,
        SkillAssessment.skill_id == assessment.skill_id
    ).first()

    if existing:
        for key, value in assessment.dict(exclude_unset=True).items():
            setattr(existing, key, value)
        db_assessment = existing
    else:
        db_assessment = SkillAssessment(**assessment.dict())
        db.add(db_assessment)

    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/gap-analysis/{user_id}/{role_id}", response_model=SkillGapResponse)
async def analyze_skill_gaps(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db)
):
    """Analyze skill gaps for a user targeting a specific role."""
    # Get required skills for the role
    required_skills = await get_required_skills(role_id, db)
    
    # Get user's current skill assessments
    user_assessments = db.query(SkillAssessment).filter(
        SkillAssessment.user_id == user_id,
        SkillAssessment.skill_id.in_([skill.id for skill in required_skills])
    ).all()
    
    # Calculate gaps and create recommendations
    gaps = []
    priority_skills = []
    
    for skill in required_skills:
        assessment = next(
            (a for a in user_assessments if a.skill_id == skill.id),
            None
        )
        current_level = assessment.current_level if assessment else 0
        required_level = 4  # Assuming proficiency levels 1-5
        
        if current_level < required_level:
            gap = {
                "skill_id": skill.id,
                "skill_name": skill.name,
                "current_level": current_level,
                "required_level": required_level,
                "gap": required_level - current_level
            }
            gaps.append(gap)
            
            if (required_level - current_level) >= 2:
                priority_skills.append(skill.id)

    # Create or update SkillGap record
    skill_gap = db.query(SkillGap).filter(
        SkillGap.user_id == user_id,
        SkillGap.target_role_id == role_id
    ).first()

    if not skill_gap:
        skill_gap = SkillGap(
            user_id=user_id,
            target_role_id=role_id
        )
        db.add(skill_gap)

    skill_gap.gap_analysis = gaps
    skill_gap.priority_skills = priority_skills
    skill_gap.recommended_path = generate_learning_path(gaps, db)
    
    db.commit()
    db.refresh(skill_gap)
    return skill_gap

@router.get("/metrics/{skill_id}", response_model=SkillMetricsResponse)
async def get_skill_metrics(skill_id: int, db: Session = Depends(get_db)):
    """Get metrics for a specific skill."""
    metrics = db.query(SkillMetrics).filter(
        SkillMetrics.skill_id == skill_id
    ).first()
    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not found")
    return metrics

@router.get("/learning-path/{user_id}/{role_id}", response_model=SkillPathResponse)
async def get_learning_path(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db)
):
    """Generate a personalized learning path."""
    skill_gap = await analyze_skill_gaps(user_id, role_id, db)
    return {
        "user_id": user_id,
        "role_id": role_id,
        "learning_path": skill_gap.recommended_path,
        "estimated_completion_time": skill_gap.estimated_completion_time,
        "priority_skills": skill_gap.priority_skills
    }

def generate_learning_path(gaps: List[dict], db: Session) -> List[dict]:
    """Generate a structured learning path based on skill gaps."""
    path = []
    
    # Sort gaps by priority (larger gaps first)
    sorted_gaps = sorted(gaps, key=lambda x: x["gap"], reverse=True)
    
    for gap in sorted_gaps:
        skill = db.query(Skill).get(gap["skill_id"])
        
        # Get prerequisites
        prerequisites = []
        if skill.prerequisites:
            for prereq in skill.prerequisites:
                prerequisites.append({
                    "skill_id": prereq.id,
                    "name": prereq.name,
                    "estimated_time": 20  # hours, should be calculated based on gap
                })
        
        # Add main skill to path
        path.append({
            "skill_id": skill.id,
            "name": skill.name,
            "current_level": gap["current_level"],
            "target_level": gap["required_level"],
            "prerequisites": prerequisites,
            "learning_resources": skill.learning_resources,
            "estimated_time": gap["gap"] * 40,  # hours, basic estimation
            "milestones": generate_milestones(gap["current_level"], gap["required_level"])
        })
    
    return path

def generate_milestones(current_level: int, target_level: int) -> List[dict]:
    """Generate milestone checkpoints for skill development."""
    milestones = []
    levels = range(current_level + 1, target_level + 1)
    
    for level in levels:
        milestones.append({
            "level": level,
            "description": f"Achieve proficiency level {level}",
            "assessment_criteria": [
                f"Complete practical exercises for level {level}",
                f"Pass assessment for level {level}",
                "Demonstrate skills in real-world scenarios"
            ]
        })
    
    return milestones
