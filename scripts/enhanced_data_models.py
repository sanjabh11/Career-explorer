"""
Enhanced Data Models for Career Explorer
Extends the existing data models with new categories while maintaining compatibility
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# Enhanced Job Requirements Models
class EducationRequirementTable(Base):
    """Detailed education and training requirements"""
    __tablename__ = 'education_requirements'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(Integer, ForeignKey('occupations.id'))
    required_level = Column(Integer)
    preferred_level = Column(Integer)
    field_of_study = Column(String)
    certifications = Column(JSON)  # List of required certifications
    licenses = Column(JSON)  # List of required licenses
    continuing_education = Column(JSON)  # Continuing education requirements
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    occupation = relationship("OccupationTable", back_populates="enhanced_education")
    training_programs = relationship("TrainingProgramTable", back_populates="education_requirement")

class TrainingProgramTable(Base):
    """Specific training programs and resources"""
    __tablename__ = 'training_programs'
    
    id = Column(Integer, primary_key=True)
    education_requirement_id = Column(Integer, ForeignKey('education_requirements.id'))
    name = Column(String)
    provider = Column(String)
    duration = Column(String)
    format = Column(String)  # online, in-person, hybrid
    cost_range = Column(String)
    success_rate = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    education_requirement = relationship("EducationRequirementTable", back_populates="training_programs")

# Career Pathways Models
class CareerProgressionTable(Base):
    """Career advancement paths and milestones"""
    __tablename__ = 'career_progressions'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(Integer, ForeignKey('occupations.id'))
    next_role = Column(String)
    typical_timeframe = Column(String)
    required_experience = Column(Float)
    required_skills = Column(JSON)
    salary_increase = Column(Float)
    difficulty_level = Column(Integer)
    success_rate = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    occupation = relationship("OccupationTable", back_populates="career_progressions")

class IndustryConnectionTable(Base):
    """Industry relationships and opportunities"""
    __tablename__ = 'industry_connections'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(Integer, ForeignKey('occupations.id'))
    industry_sector = Column(String)
    relevance_score = Column(Float)
    growth_rate = Column(Float)
    transition_difficulty = Column(Float)
    required_reskilling = Column(JSON)
    market_demand = Column(Integer)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    occupation = relationship("OccupationTable", back_populates="industry_connections")

# Work Context Models
class WorkEnvironmentTable(Base):
    """Detailed work environment characteristics"""
    __tablename__ = 'work_environments'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(Integer, ForeignKey('occupations.id'))
    physical_demands = Column(JSON)
    environmental_conditions = Column(JSON)
    safety_requirements = Column(JSON)
    schedule_flexibility = Column(Integer)
    remote_work_potential = Column(Float)
    collaboration_level = Column(Integer)
    stress_level = Column(Integer)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    occupation = relationship("OccupationTable", back_populates="enhanced_environment")

class WorkActivityDetailTable(Base):
    """Detailed work activities and processes"""
    __tablename__ = 'work_activity_details'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(Integer, ForeignKey('occupations.id'))
    activity_type = Column(String)
    cognitive_load = Column(Integer)
    interpersonal_intensity = Column(Integer)
    technical_complexity = Column(Integer)
    autonomy_level = Column(Integer)
    decision_making_frequency = Column(Integer)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    occupation = relationship("OccupationTable", back_populates="activity_details")

# Automation Impact Models
class AutomationRiskTable(Base):
    """Detailed automation risk analysis"""
    __tablename__ = 'automation_risks'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(Integer, ForeignKey('occupations.id'))
    overall_risk_score = Column(Float)
    task_automation_potential = Column(JSON)
    technology_impact_timeline = Column(JSON)
    required_adaptations = Column(JSON)
    market_stability = Column(Integer)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    occupation = relationship("OccupationTable", back_populates="automation_risk")

class SkillTransitionTable(Base):
    """Skill adaptation and transition paths"""
    __tablename__ = 'skill_transitions'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(Integer, ForeignKey('occupations.id'))
    current_skills = Column(JSON)
    target_skills = Column(JSON)
    gap_analysis = Column(JSON)
    transition_difficulty = Column(Float)
    estimated_timeframe = Column(String)
    recommended_resources = Column(JSON)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    occupation = relationship("OccupationTable", back_populates="skill_transitions")

# Update OccupationTable relationships
def update_occupation_relationships():
    """
    Updates the OccupationTable class with new relationships.
    This function should be called after all models are defined.
    """
    from scripts.onet_technical_specs5 import OccupationTable
    
    # Add new relationship properties
    OccupationTable.enhanced_education = relationship("EducationRequirementTable", back_populates="occupation")
    OccupationTable.career_progressions = relationship("CareerProgressionTable", back_populates="occupation")
    OccupationTable.industry_connections = relationship("IndustryConnectionTable", back_populates="occupation")
    OccupationTable.enhanced_environment = relationship("WorkEnvironmentTable", back_populates="occupation")
    OccupationTable.activity_details = relationship("WorkActivityDetailTable", back_populates="occupation")
    OccupationTable.automation_risk = relationship("AutomationRiskTable", back_populates="occupation")
    OccupationTable.skill_transitions = relationship("SkillTransitionTable", back_populates="occupation")
