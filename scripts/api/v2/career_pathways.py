from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from ...database import get_db
from ...models.career_pathways import (
    CareerPath,
    IndustrySector,
    ExperienceMilestone,
    occupation_connections,
    occupation_sectors
)

router = APIRouter(prefix="/api/v2/career-paths", tags=["career-paths"])

# Pydantic models
class CareerPathBase(BaseModel):
    path_name: str
    description: str
    typical_duration: int
    advancement_steps: List[dict]
    required_certifications: List[str]
    skill_milestones: List[dict]
    salary_progression: List[dict]
    success_factors: List[dict]

class IndustrySectorBase(BaseModel):
    name: str
    description: str
    market_size: float
    growth_rate: float
    employment_count: int
    top_companies: List[dict]
    key_technologies: List[str]
    market_trends: List[dict]
    geographical_hotspots: List[dict]

class ExperienceMilestoneBase(BaseModel):
    title: str
    years_experience: int
    level: str
    key_responsibilities: List[str]
    required_skills: List[dict]
    typical_projects: List[dict]
    leadership_scope: dict
    salary_range: dict
    next_steps: List[dict]

class OccupationConnectionBase(BaseModel):
    target_occupation_id: str
    connection_type: str
    similarity_score: float = Field(..., ge=0, le=1)
    skill_overlap: List[dict]
    transition_difficulty: int = Field(..., ge=1, le=10)

# Career Path endpoints
@router.get("/paths/{occupation_id}")
async def get_career_paths(
    occupation_id: str,
    db: Session = Depends(get_db)
):
    paths = db.query(CareerPath).filter(
        CareerPath.occupation_id == occupation_id
    ).all()
    if not paths:
        raise HTTPException(status_code=404, detail="Career paths not found")
    return paths

@router.post("/paths/{occupation_id}")
async def create_career_path(
    occupation_id: str,
    path: CareerPathBase,
    db: Session = Depends(get_db)
):
    db_path = CareerPath(
        occupation_id=occupation_id,
        **path.dict()
    )
    db.add(db_path)
    db.commit()
    db.refresh(db_path)
    return db_path

# Industry Sector endpoints
@router.get("/sectors")
async def get_industry_sectors(
    growth_rate_min: Optional[float] = None,
    market_size_min: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(IndustrySector)
    if growth_rate_min is not None:
        query = query.filter(IndustrySector.growth_rate >= growth_rate_min)
    if market_size_min is not None:
        query = query.filter(IndustrySector.market_size >= market_size_min)
    return query.all()

@router.get("/sectors/{sector_id}/occupations")
async def get_sector_occupations(
    sector_id: int,
    min_demand: Optional[int] = None,
    min_growth: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(occupation_sectors).filter(
        occupation_sectors.c.sector_id == sector_id
    )
    if min_demand:
        query = query.filter(occupation_sectors.c.demand_level >= min_demand)
    if min_growth:
        query = query.filter(occupation_sectors.c.growth_potential >= min_growth)
    return query.all()

# Experience Milestone endpoints
@router.get("/milestones/{occupation_id}")
async def get_experience_milestones(
    occupation_id: str,
    level: Optional[str] = None,
    min_years: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExperienceMilestone).filter(
        ExperienceMilestone.occupation_id == occupation_id
    )
    if level:
        query = query.filter(ExperienceMilestone.level == level)
    if min_years:
        query = query.filter(ExperienceMilestone.years_experience >= min_years)
    milestones = query.all()
    if not milestones:
        raise HTTPException(status_code=404, detail="Experience milestones not found")
    return milestones

@router.post("/milestones/{occupation_id}")
async def create_experience_milestone(
    occupation_id: str,
    milestone: ExperienceMilestoneBase,
    db: Session = Depends(get_db)
):
    db_milestone = ExperienceMilestone(
        occupation_id=occupation_id,
        **milestone.dict()
    )
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

# Related Occupations endpoints
@router.get("/related/{occupation_id}")
async def get_related_occupations(
    occupation_id: str,
    connection_type: Optional[str] = None,
    min_similarity: Optional[float] = None,
    max_difficulty: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(occupation_connections).filter(
        occupation_connections.c.source_occupation_id == occupation_id
    )
    if connection_type:
        query = query.filter(occupation_connections.c.connection_type == connection_type)
    if min_similarity:
        query = query.filter(occupation_connections.c.similarity_score >= min_similarity)
    if max_difficulty:
        query = query.filter(occupation_connections.c.transition_difficulty <= max_difficulty)
    return query.all()

@router.post("/related/{occupation_id}")
async def create_occupation_connection(
    occupation_id: str,
    connection: OccupationConnectionBase,
    db: Session = Depends(get_db)
):
    db_connection = {
        "source_occupation_id": occupation_id,
        "target_occupation_id": connection.target_occupation_id,
        "connection_type": connection.connection_type,
        "similarity_score": connection.similarity_score,
        "skill_overlap": connection.skill_overlap,
        "transition_difficulty": connection.transition_difficulty,
        "created_at": datetime.utcnow()
    }
    db.execute(occupation_connections.insert().values(**db_connection))
    db.commit()
    return db_connection
