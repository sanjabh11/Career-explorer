from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ...database import get_db
from ...models.industry_analysis import (
    IndustryTrend,
    IndustryRequirement,
    SectorGrowth,
    CompetitiveAnalysis,
    cross_industry_requirements
)

router = APIRouter(prefix="/api/v2/industry-analysis", tags=["industry-analysis"])

# Pydantic models for request/response
class TrendBase(BaseModel):
    industry_sector: str
    trend_type: str
    time_period: str
    trend_data: dict
    impact_score: float = Field(..., ge=1, le=10)
    confidence_level: float = Field(..., ge=0, le=1)
    data_sources: List[dict]

class RequirementBase(BaseModel):
    industry_sector: str
    requirement_type: str
    requirement_name: str
    importance_score: float = Field(..., ge=1, le=10)
    frequency_score: float = Field(..., ge=1, le=10)
    future_relevance: float = Field(..., ge=1, le=10)
    requirement_details: dict
    alternatives: List[dict]

class GrowthBase(BaseModel):
    industry_sector: str
    region: str
    time_period: str
    growth_rate: float
    job_openings: int
    salary_trends: dict
    growth_factors: List[dict]
    risk_factors: List[dict]
    opportunity_score: float = Field(..., ge=1, le=10)
    data_quality: float = Field(..., ge=0, le=1)

# Industry Trends endpoints
@router.get("/trends")
async def get_trends(
    industry_sector: Optional[str] = None,
    trend_type: Optional[str] = None,
    min_impact: Optional[float] = None,
    min_confidence: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(IndustryTrend)
    if industry_sector:
        query = query.filter(IndustryTrend.industry_sector == industry_sector)
    if trend_type:
        query = query.filter(IndustryTrend.trend_type == trend_type)
    if min_impact:
        query = query.filter(IndustryTrend.impact_score >= min_impact)
    if min_confidence:
        query = query.filter(IndustryTrend.confidence_level >= min_confidence)
    return query.all()

@router.post("/trends")
async def create_trend(
    trend: TrendBase,
    db: Session = Depends(get_db)
):
    db_trend = IndustryTrend(**trend.dict())
    db.add(db_trend)
    db.commit()
    db.refresh(db_trend)
    return db_trend

# Industry Requirements endpoints
@router.get("/requirements")
async def get_requirements(
    industry_sector: Optional[str] = None,
    requirement_type: Optional[str] = None,
    min_importance: Optional[float] = None,
    min_future_relevance: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(IndustryRequirement)
    if industry_sector:
        query = query.filter(IndustryRequirement.industry_sector == industry_sector)
    if requirement_type:
        query = query.filter(IndustryRequirement.requirement_type == requirement_type)
    if min_importance:
        query = query.filter(IndustryRequirement.importance_score >= min_importance)
    if min_future_relevance:
        query = query.filter(IndustryRequirement.future_relevance >= min_future_relevance)
    return query.all()

@router.get("/requirements/comparison")
async def compare_requirements(
    source_industry: str,
    target_industry: str,
    min_similarity: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(cross_industry_requirements).join(
        IndustryRequirement,
        cross_industry_requirements.c.source_industry_id == IndustryRequirement.id
    ).filter(
        IndustryRequirement.industry_sector == source_industry
    )
    if min_similarity:
        query = query.filter(cross_industry_requirements.c.similarity_score >= min_similarity)
    return query.all()

# Sector Growth endpoints
@router.get("/growth")
async def get_sector_growth(
    industry_sector: Optional[str] = None,
    region: Optional[str] = None,
    min_growth_rate: Optional[float] = None,
    min_opportunity: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SectorGrowth)
    if industry_sector:
        query = query.filter(SectorGrowth.industry_sector == industry_sector)
    if region:
        query = query.filter(SectorGrowth.region == region)
    if min_growth_rate:
        query = query.filter(SectorGrowth.growth_rate >= min_growth_rate)
    if min_opportunity:
        query = query.filter(SectorGrowth.opportunity_score >= min_opportunity)
    return query.all()

@router.post("/growth")
async def create_growth_data(
    growth: GrowthBase,
    db: Session = Depends(get_db)
):
    db_growth = SectorGrowth(**growth.dict())
    db.add(db_growth)
    db.commit()
    db.refresh(db_growth)
    return db_growth

# Analysis aggregation endpoints
@router.get("/analysis/comprehensive")
async def get_comprehensive_analysis(
    industry_sector: str,
    time_period: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get comprehensive industry analysis including trends, requirements, and growth data"""
    trends = db.query(IndustryTrend).filter(
        IndustryTrend.industry_sector == industry_sector
    )
    if time_period:
        trends = trends.filter(IndustryTrend.time_period == time_period)

    requirements = db.query(IndustryRequirement).filter(
        IndustryRequirement.industry_sector == industry_sector
    )

    growth = db.query(SectorGrowth).filter(
        SectorGrowth.industry_sector == industry_sector
    )
    if time_period:
        growth = growth.filter(SectorGrowth.time_period == time_period)

    return {
        "trends": trends.all(),
        "requirements": requirements.all(),
        "growth": growth.all()
    }

@router.get("/analysis/opportunities")
async def get_industry_opportunities(
    industry_sector: str,
    region: Optional[str] = None,
    min_growth_rate: Optional[float] = None,
    min_opportunity_score: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get industry opportunities based on growth and competitive analysis"""
    growth_query = db.query(SectorGrowth).filter(
        SectorGrowth.industry_sector == industry_sector
    )
    if region:
        growth_query = growth_query.filter(SectorGrowth.region == region)
    if min_growth_rate:
        growth_query = growth_query.filter(SectorGrowth.growth_rate >= min_growth_rate)
    if min_opportunity_score:
        growth_query = growth_query.filter(SectorGrowth.opportunity_score >= min_opportunity_score)

    competitive = db.query(CompetitiveAnalysis).filter(
        CompetitiveAnalysis.industry_sector == industry_sector
    )

    return {
        "growth_data": growth_query.all(),
        "competitive_analysis": competitive.all()
    }
