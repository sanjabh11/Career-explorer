from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ...models.education_requirements import (
    EducationRequirement,
    Certification,
    EducationMetrics
)
from ...database import get_db
from ...utils.metrics import track_metric

router = APIRouter(prefix="/api/v2/education")

class EducationRequirementBase(BaseModel):
    min_education_level: str
    preferred_education_level: str
    required_majors: List[str]
    alternative_paths: List[dict]
    continuing_education: dict
    experience_substitution: dict
    importance_score: float

class CertificationBase(BaseModel):
    name: str
    provider: str
    description: str
    requirements: dict
    validity_period: int
    renewal_requirements: dict
    cost_range: dict
    preparation_resources: List[str]
    industry_recognition_score: float

@router.get("/requirements/{role_id}")
async def get_education_requirements(
    role_id: int,
    db: Session = Depends(get_db)
):
    """Get education requirements for a specific role"""
    requirements = db.query(EducationRequirement).filter(
        EducationRequirement.role_id == role_id
    ).first()
    
    if not requirements:
        raise HTTPException(status_code=404, detail="Requirements not found")
    
    # Track metrics
    await track_metric(
        db,
        "education_view",
        {"role_id": role_id, "timestamp": datetime.now()}
    )
    
    return requirements

@router.get("/certifications/{role_id}")
async def get_role_certifications(
    role_id: int,
    filter_by_recognition: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get certifications relevant for a role"""
    query = db.query(Certification).join(
        certification_role
    ).filter(certification_role.c.role_id == role_id)
    
    if filter_by_recognition:
        query = query.filter(
            Certification.industry_recognition_score >= filter_by_recognition
        )
    
    certifications = query.all()
    return certifications

@router.get("/metrics/{role_id}")
async def get_education_metrics(
    role_id: int,
    time_range: Optional[str] = "30d",
    db: Session = Depends(get_db)
):
    """Get education-related metrics for a role"""
    metrics = db.query(EducationMetrics).filter(
        EducationMetrics.role_id == role_id
    ).first()
    
    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not found")
    
    return metrics

@router.get("/path-analysis/{role_id}")
async def analyze_education_path(
    role_id: int,
    current_education: str,
    target_position: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Analyze education path and provide recommendations"""
    requirements = await get_education_requirements(role_id, db)
    
    # Calculate gap between current and required education
    education_gap = {
        "missing_requirements": [],
        "recommended_certifications": [],
        "alternative_paths": [],
        "estimated_completion_time": 0,
        "estimated_cost_range": {"min": 0, "max": 0}
    }
    
    # Add recommendations based on requirements
    if requirements.min_education_level != current_education:
        education_gap["missing_requirements"].append({
            "type": "education_level",
            "required": requirements.min_education_level,
            "current": current_education
        })
    
    # Get relevant certifications
    certifications = await get_role_certifications(role_id, db)
    education_gap["recommended_certifications"] = [
        {
            "name": cert.name,
            "provider": cert.provider,
            "recognition_score": cert.industry_recognition_score,
            "estimated_time": cert.average_preparation_time,
            "cost_range": cert.cost_range
        }
        for cert in certifications
    ]
    
    return education_gap

@router.post("/track-completion/{role_id}")
async def track_education_completion(
    role_id: int,
    education_type: str,
    completion_time: int,
    success_rating: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Track education completion metrics"""
    metrics = EducationMetrics(
        role_id=role_id,
        timestamp=datetime.now().timestamp(),
        path_completion_rate=1.0,
        time_to_completion=completion_time
    )
    
    db.add(metrics)
    db.commit()
    
    return {"status": "success", "message": "Completion tracked successfully"}
