from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Association tables
certification_role = Table(
    'certification_role',
    Base.metadata,
    Column('certification_id', Integer, ForeignKey('certifications.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

class EducationRequirement(Base):
    __tablename__ = 'education_requirements'
    
    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'))
    min_education_level = Column(String(100))  # e.g., "Bachelor's Degree"
    preferred_education_level = Column(String(100))
    required_majors = Column(JSON)  # List of relevant majors
    alternative_paths = Column(JSON)  # Alternative education paths
    continuing_education = Column(JSON)  # Ongoing education requirements
    experience_substitution = Column(JSON)  # Experience that can substitute education
    importance_score = Column(Float)  # How important is education for this role (0-1)
    
    # Metrics for tracking
    view_count = Column(Integer, default=0)
    application_rate = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)

class Certification(Base):
    __tablename__ = 'certifications'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    provider = Column(String(200))
    description = Column(String(1000))
    requirements = Column(JSON)  # Prerequisites and requirements
    validity_period = Column(Integer)  # In months
    renewal_requirements = Column(JSON)
    cost_range = Column(JSON)  # Min and max cost
    preparation_resources = Column(JSON)
    industry_recognition_score = Column(Float)  # 0-1 scale
    
    roles = relationship('Role', secondary=certification_role, back_populates='certifications')
    
    # Metrics
    completion_rate = Column(Float, default=0.0)
    average_preparation_time = Column(Integer)  # In hours
    employer_demand_score = Column(Float)  # 0-1 scale

class EducationMetrics(Base):
    __tablename__ = 'education_metrics'
    
    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'))
    timestamp = Column(Integer)
    
    # User engagement metrics
    page_views = Column(Integer, default=0)
    avg_time_spent = Column(Float)  # In seconds
    download_count = Column(Integer, default=0)
    
    # Education path effectiveness
    path_completion_rate = Column(Float)
    time_to_completion = Column(Float)  # In months
    career_progression_rate = Column(Float)
    
    # ROI metrics
    salary_impact = Column(Float)  # Percentage increase
    career_mobility_score = Column(Float)  # 0-1 scale
    industry_demand_correlation = Column(Float)  # -1 to 1 scale
