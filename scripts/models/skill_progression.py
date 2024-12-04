from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Association table for skill dependencies
skill_dependencies = Table(
    'skill_dependencies',
    Base.metadata,
    Column('prerequisite_skill_id', Integer, ForeignKey('skills.id'), primary_key=True),
    Column('dependent_skill_id', Integer, ForeignKey('skills.id'), primary_key=True),
    Column('dependency_type', String(50)),  # e.g., "required", "recommended"
    Column('strength', Integer),  # 1-10 scale
    Column('created_at', DateTime, default=datetime.utcnow)
)

class Skill(Base):
    __tablename__ = 'skills'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100))
    description = Column(String(500))
    proficiency_levels = Column(JSON)  # Array of level descriptions
    learning_duration = Column(JSON)  # Estimated time per level
    assessment_criteria = Column(JSON)  # Criteria for each level
    industry_relevance = Column(JSON)  # Relevance scores by industry
    future_outlook = Column(JSON)  # Growth predictions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prerequisites = relationship(
        'Skill',
        secondary=skill_dependencies,
        primaryjoin=id==skill_dependencies.c.dependent_skill_id,
        secondaryjoin=id==skill_dependencies.c.prerequisite_skill_id,
        backref='dependent_skills'
    )

class LearningPath(Base):
    __tablename__ = 'learning_paths'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    difficulty_level = Column(Integer)  # 1-10 scale
    estimated_duration = Column(Integer)  # in hours
    target_role = Column(String(200))
    prerequisites = Column(JSON)  # Required base knowledge
    learning_objectives = Column(JSON)  # Key learning outcomes
    industry_alignment = Column(JSON)  # Relevant industries
    career_impact = Column(JSON)  # Expected career benefits
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LearningResource(Base):
    __tablename__ = 'learning_resources'
    
    id = Column(Integer, primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.id'), nullable=False)
    title = Column(String(200), nullable=False)
    type = Column(String(50))  # e.g., "course", "book", "workshop"
    provider = Column(String(200))
    format = Column(String(50))  # e.g., "video", "text", "interactive"
    duration = Column(Integer)  # in hours
    difficulty_level = Column(Integer)  # 1-10 scale
    cost = Column(Float)
    url = Column(String(500))
    rating = Column(Float)
    review_count = Column(Integer)
    completion_rate = Column(Float)
    effectiveness_score = Column(Float)
    prerequisites = Column(JSON)
    learning_objectives = Column(JSON)
    content_outline = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skill = relationship("Skill", backref="learning_resources")

class ProgressTracking(Base):
    __tablename__ = 'progress_tracking'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(50), nullable=False)
    skill_id = Column(Integer, ForeignKey('skills.id'), nullable=False)
    current_level = Column(Integer)
    target_level = Column(Integer)
    progress_percentage = Column(Float)
    time_spent = Column(Integer)  # in hours
    completed_resources = Column(JSON)  # List of completed learning resources
    assessment_results = Column(JSON)  # Results of skill assessments
    milestones_achieved = Column(JSON)  # Key achievements
    next_steps = Column(JSON)  # Recommended next actions
    learning_pace = Column(Float)  # Progress rate
    strengths = Column(JSON)  # Areas of strong performance
    areas_for_improvement = Column(JSON)  # Areas needing focus
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skill = relationship("Skill", backref="progress_records")

class SkillAssessment(Base):
    __tablename__ = 'skill_assessments'
    
    id = Column(Integer, primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.id'), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    assessment_type = Column(String(50))  # e.g., "quiz", "project", "interview"
    difficulty_level = Column(Integer)  # 1-10 scale
    duration = Column(Integer)  # in minutes
    passing_score = Column(Float)
    questions = Column(JSON)  # Assessment questions/tasks
    rubric = Column(JSON)  # Evaluation criteria
    prerequisites = Column(JSON)  # Required knowledge/skills
    certification = Column(JSON)  # Certification details if applicable
    validity_period = Column(Integer)  # in months
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skill = relationship("Skill", backref="assessments")

# Update Skill model relationships
def update_skill_model(Base):
    class Skill(Base):
        __tablename__ = 'skills'
        
        learning_resources = relationship(
            "LearningResource",
            back_populates="skill",
            cascade="all, delete-orphan"
        )
        progress_records = relationship(
            "ProgressTracking",
            back_populates="skill",
            cascade="all, delete-orphan"
        )
        assessments = relationship(
            "SkillAssessment",
            back_populates="skill",
            cascade="all, delete-orphan"
        )
