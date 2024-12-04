from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class EducationRequirementDetail(Base):
    __tablename__ = 'education_requirement_details'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    degree_level = Column(String(100), nullable=False)  # e.g., "Bachelor's", "Master's"
    field_of_study = Column(String(200))
    required = Column(Boolean, default=False)
    preferred = Column(Boolean, default=False)
    importance_score = Column(Float)  # 0-100 scale
    typical_time_to_complete = Column(Integer)  # in months
    alternative_paths = Column(JSON)  # Array of alternative education paths
    recommended_institutions = Column(JSON)  # Array of recommended schools/programs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="education_details")

class SkillFrameworkModel(Base):
    __tablename__ = 'skill_framework'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    skill_category = Column(String(100))  # e.g., "Technical", "Soft Skills"
    skill_name = Column(String(200))
    description = Column(String(500))
    proficiency_level_required = Column(Integer)  # 1-5 scale
    importance_score = Column(Float)  # 0-100 scale
    time_to_acquire = Column(Integer)  # estimated time in hours
    prerequisites = Column(JSON)  # Array of prerequisite skills
    learning_resources = Column(JSON)  # Array of recommended learning resources
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="skill_framework")

class CertificationRequirement(Base):
    __tablename__ = 'certification_requirements'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    certification_name = Column(String(200))
    provider = Column(String(200))
    level = Column(String(50))  # e.g., "Basic", "Advanced"
    required = Column(Boolean, default=False)
    preferred = Column(Boolean, default=False)
    validity_period = Column(Integer)  # in months
    estimated_cost = Column(Float)
    prerequisites = Column(JSON)  # Array of prerequisites
    renewal_requirements = Column(JSON)  # Renewal criteria
    exam_details = Column(JSON)  # Exam format, passing score, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="certification_requirements")

class TrainingRecommendation(Base):
    __tablename__ = 'training_recommendations'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    skill_id = Column(Integer, ForeignKey('skill_framework.id'))
    training_type = Column(String(100))  # e.g., "Online Course", "Workshop"
    provider = Column(String(200))
    course_name = Column(String(300))
    description = Column(String(500))
    duration = Column(Integer)  # in hours
    cost = Column(Float)
    difficulty_level = Column(String(50))  # e.g., "Beginner", "Advanced"
    prerequisites = Column(JSON)  # Array of prerequisites
    learning_outcomes = Column(JSON)  # Expected outcomes
    rating = Column(Float)  # Average user rating
    review_count = Column(Integer)
    url = Column(String(500))  # Course URL
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="training_recommendations")
    skill = relationship("SkillFrameworkModel")

# Add relationships to existing Occupation model
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .occupation import Occupation

def update_occupation_model(Base):
    class Occupation(Base):
        __tablename__ = 'occupations'
        
        education_details = relationship(
            "EducationRequirementDetail",
            back_populates="occupation",
            cascade="all, delete-orphan"
        )
        skill_framework = relationship(
            "SkillFrameworkModel",
            back_populates="occupation",
            cascade="all, delete-orphan"
        )
        certification_requirements = relationship(
            "CertificationRequirement",
            back_populates="occupation",
            cascade="all, delete-orphan"
        )
        training_recommendations = relationship(
            "TrainingRecommendation",
            back_populates="occupation",
            cascade="all, delete-orphan"
        )
