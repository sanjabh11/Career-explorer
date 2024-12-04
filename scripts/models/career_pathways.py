from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Association table for occupation connections
occupation_connections = Table(
    'occupation_connections',
    Base.metadata,
    Column('source_occupation_id', String(10), ForeignKey('occupations.id'), primary_key=True),
    Column('target_occupation_id', String(10), ForeignKey('occupations.id'), primary_key=True),
    Column('connection_type', String(50)),  # e.g., "advancement", "lateral", "specialization"
    Column('similarity_score', Float),
    Column('skill_overlap', JSON),  # Shared skills between occupations
    Column('transition_difficulty', Integer),  # 1-10 scale
    Column('created_at', DateTime, default=datetime.utcnow),
)

class CareerPath(Base):
    __tablename__ = 'career_paths'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    path_name = Column(String(200))  # e.g., "Management Track", "Technical Specialist"
    description = Column(String(500))
    typical_duration = Column(Integer)  # in months
    advancement_steps = Column(JSON)  # Array of steps with requirements
    required_certifications = Column(JSON)  # Array of certification IDs
    skill_milestones = Column(JSON)  # Key skills to acquire
    salary_progression = Column(JSON)  # Expected salary ranges at each step
    success_factors = Column(JSON)  # Key factors for success
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="career_paths")

class IndustrySector(Base):
    __tablename__ = 'industry_sectors'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    description = Column(String(500))
    market_size = Column(Float)  # in billions USD
    growth_rate = Column(Float)  # annual percentage
    employment_count = Column(Integer)
    top_companies = Column(JSON)  # Array of major employers
    key_technologies = Column(JSON)  # Important technologies
    market_trends = Column(JSON)  # Current industry trends
    geographical_hotspots = Column(JSON)  # Regions with high activity
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupations = relationship("Occupation", secondary="occupation_sectors")

class ExperienceMilestone(Base):
    __tablename__ = 'experience_milestones'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    title = Column(String(200))  # e.g., "Senior Developer", "Team Lead"
    years_experience = Column(Integer)
    level = Column(String(50))  # e.g., "Entry", "Mid", "Senior"
    key_responsibilities = Column(JSON)  # Array of main duties
    required_skills = Column(JSON)  # Skills needed at this level
    typical_projects = Column(JSON)  # Example projects/achievements
    leadership_scope = Column(JSON)  # Leadership responsibilities
    salary_range = Column(JSON)  # Expected salary range
    next_steps = Column(JSON)  # Potential next career moves
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="experience_milestones")

# Association table for occupation-sector relationships
occupation_sectors = Table(
    'occupation_sectors',
    Base.metadata,
    Column('occupation_id', String(10), ForeignKey('occupations.id'), primary_key=True),
    Column('sector_id', Integer, ForeignKey('industry_sectors.id'), primary_key=True),
    Column('demand_level', Integer),  # 1-10 scale
    Column('growth_potential', Float),  # Annual percentage
    Column('average_salary', Float),
    Column('created_at', DateTime, default=datetime.utcnow),
)

# Update Occupation model relationships
def update_occupation_model(Base):
    class Occupation(Base):
        __tablename__ = 'occupations'
        
        career_paths = relationship(
            "CareerPath",
            back_populates="occupation",
            cascade="all, delete-orphan"
        )
        experience_milestones = relationship(
            "ExperienceMilestone",
            back_populates="occupation",
            cascade="all, delete-orphan"
        )
        sectors = relationship(
            "IndustrySector",
            secondary="occupation_sectors",
            back_populates="occupations"
        )
        related_occupations = relationship(
            "Occupation",
            secondary="occupation_connections",
            primaryjoin="Occupation.id==occupation_connections.c.source_occupation_id",
            secondaryjoin="Occupation.id==occupation_connections.c.target_occupation_id",
            backref="source_occupations"
        )
