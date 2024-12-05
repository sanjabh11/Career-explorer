from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ...models.work_environment import WorkEnvironment, WorkEnvironmentAssessment, WorkEnvironmentMetrics
from ...database import get_db
from ...schemas.work_environment import (
    WorkEnvironmentCreate,
    WorkEnvironmentResponse,
    WorkEnvironmentAssessmentCreate,
    WorkEnvironmentAssessmentResponse,
    WorkEnvironmentMetricsResponse
)

router = APIRouter(prefix="/api/v2/work-environment", tags=["work-environment"])

@router.get("/{role_id}", response_model=WorkEnvironmentResponse)
async def get_work_environment(role_id: int, db: Session = Depends(get_db)):
    """Get work environment details for a specific role."""
    environment = db.query(WorkEnvironment).filter(WorkEnvironment.role_id == role_id).first()
    if not environment:
        raise HTTPException(status_code=404, detail="Work environment not found")
    return environment

@router.post("/assessment", response_model=WorkEnvironmentAssessmentResponse)
async def create_assessment(
    assessment: WorkEnvironmentAssessmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new work environment assessment."""
    db_assessment = WorkEnvironmentAssessment(**assessment.dict())
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/assessment/{user_id}/{role_id}", response_model=WorkEnvironmentAssessmentResponse)
async def get_user_assessment(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db)
):
    """Get a user's work environment assessment for a specific role."""
    assessment = (
        db.query(WorkEnvironmentAssessment)
        .join(WorkEnvironment)
        .filter(
            WorkEnvironmentAssessment.user_id == user_id,
            WorkEnvironment.role_id == role_id
        )
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.get("/metrics/{role_id}", response_model=WorkEnvironmentMetricsResponse)
async def get_environment_metrics(role_id: int, db: Session = Depends(get_db)):
    """Get work environment metrics for a specific role."""
    metrics = db.query(WorkEnvironmentMetrics).filter(
        WorkEnvironmentMetrics.role_id == role_id
    ).first()
    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not found")
    return metrics

@router.get("/compatibility/{user_id}/{role_id}")
async def calculate_compatibility(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db)
):
    """Calculate work environment compatibility score for a user and role."""
    assessment = await get_user_assessment(user_id, role_id, db)
    environment = await get_work_environment(role_id, db)
    
    # Calculate weighted compatibility score
    weights = {
        'physical': 0.25,
        'environmental': 0.2,
        'stress': 0.2,
        'safety': 0.2,
        'flexibility': 0.15
    }
    
    compatibility_score = (
        assessment.physical_score * weights['physical'] +
        assessment.environmental_score * weights['environmental'] +
        assessment.stress_score * weights['stress'] +
        assessment.safety_score * weights['safety'] +
        assessment.flexibility_score * weights['flexibility']
    )
    
    return {
        "overall_compatibility": compatibility_score,
        "breakdown": {
            "physical": assessment.physical_score,
            "environmental": assessment.environmental_score,
            "stress": assessment.stress_score,
            "safety": assessment.safety_score,
            "flexibility": assessment.flexibility_score
        },
        "recommendations": generate_recommendations(assessment, environment)
    }

def generate_recommendations(assessment: WorkEnvironmentAssessment, environment: WorkEnvironment):
    """Generate personalized recommendations based on assessment results."""
    recommendations = []
    
    # Physical demands recommendations
    if assessment.physical_score < 0.7:
        recommendations.append({
            "category": "physical",
            "suggestion": "Consider ergonomic adjustments or physical conditioning",
            "priority": "high"
        })
    
    # Environmental recommendations
    if assessment.environmental_score < 0.7:
        recommendations.append({
            "category": "environmental",
            "suggestion": "Explore workplace modifications or protective measures",
            "priority": "medium"
        })
    
    # Stress management recommendations
    if assessment.stress_score < 0.7:
        recommendations.append({
            "category": "stress",
            "suggestion": "Consider stress management techniques or workplace counseling",
            "priority": "high"
        })
    
    return recommendations
