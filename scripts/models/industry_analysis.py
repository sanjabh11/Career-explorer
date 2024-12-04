from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class IndustryTrend(Base):
    __tablename__ = 'industry_trends'
    
    id = Column(Integer, primary_key=True)
    industry_sector = Column(String(200), nullable=False)
    trend_type = Column(String(50))  # e.g., "growth", "technology", "workforce"
    time_period = Column(String(50))  # e.g., "2023-2025", "2025-2030"
    trend_data = Column(JSON)  # Detailed trend information
    impact_score = Column(Float)  # 1-10 scale
    confidence_level = Column(Float)  # Confidence in prediction (0-1)
    data_sources = Column(JSON)  # Sources of trend data
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class IndustryRequirement(Base):
    __tablename__ = 'industry_requirements'
    
    id = Column(Integer, primary_key=True)
    industry_sector = Column(String(200), nullable=False)
    requirement_type = Column(String(50))  # e.g., "skill", "certification", "education"
    requirement_name = Column(String(200))
    importance_score = Column(Float)  # 1-10 scale
    frequency_score = Column(Float)  # 1-10 scale
    future_relevance = Column(Float)  # 1-10 scale
    requirement_details = Column(JSON)  # Detailed requirement information
    alternatives = Column(JSON)  # Alternative requirements
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class SectorGrowth(Base):
    __tablename__ = 'sector_growth'
    
    id = Column(Integer, primary_key=True)
    industry_sector = Column(String(200), nullable=False)
    region = Column(String(100))  # Geographic region
    time_period = Column(String(50))
    growth_rate = Column(Float)
    job_openings = Column(Integer)
    salary_trends = Column(JSON)
    growth_factors = Column(JSON)  # Factors contributing to growth
    risk_factors = Column(JSON)  # Potential risks to growth
    opportunity_score = Column(Float)  # Combined opportunity score (1-10)
    data_quality = Column(Float)  # Quality of data (0-1)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class CompetitiveAnalysis(Base):
    __tablename__ = 'competitive_analysis'
    
    id = Column(Integer, primary_key=True)
    industry_sector = Column(String(200), nullable=False)
    analysis_type = Column(String(50))  # e.g., "market_share", "innovation", "workforce"
    time_period = Column(String(50))
    metrics = Column(JSON)  # Key competitive metrics
    benchmarks = Column(JSON)  # Industry benchmarks
    trends = Column(JSON)  # Competitive trends
    opportunities = Column(JSON)  # Growth opportunities
    threats = Column(JSON)  # Market threats
    analysis_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

# Association table for cross-industry requirements
cross_industry_requirements = Table(
    'cross_industry_requirements',
    Base.metadata,
    Column('source_industry_id', Integer, ForeignKey('industry_requirements.id'), primary_key=True),
    Column('target_industry_id', Integer, ForeignKey('industry_requirements.id'), primary_key=True),
    Column('similarity_score', Float),  # How similar the requirements are (0-1)
    Column('transition_difficulty', Float),  # Difficulty of transition (1-10)
    Column('skill_gaps', JSON),  # Skills needed for transition
    Column('created_at', DateTime, default=datetime.utcnow)
)
